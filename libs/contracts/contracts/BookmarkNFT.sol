// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract BookmarkNFT is ERC721URIStorage, Ownable {

    uint public constant version = 1;

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    uint public creationTime;
    string public description;
    enum CloneFilter { All, OnlyClones, NoClones }

    uint256 private _defaultClonePrice = 0;
    mapping(uint256 => bool) private _isClone;
    mapping(uint256 => uint256) private _cloneOf;
    mapping(uint256 => uint256) private _clonePrice;
    mapping(uint256 => bool) private _hasClonePrice;
    mapping(string => uint256[]) private _urlToTokenId; 

    mapping(uint256 => address) private _idToCreator;
    address private _creator;
    // Keep track of all tokens owned by a given address   
    mapping(address => uint256[]) private _ownedTokens;

    //Keep track of all clones of a given original token     
    mapping(uint256 => uint256[]) private _clonesOfOriginal;
    mapping(uint256 => uint) private _mintedTime;
    
    // Keep track of all tokens
    uint256[] private _allTokens;

    uint256 private _totalMintedOriginalTokens;
    uint256 private _totalMintedCloneTokens;

    // to be able to share lists with friends allow to add approved minters
    mapping(address => bool) private _approvedMinters;
    address[] private minters;

    constructor(string memory name, string memory symbol, string memory _description, uint256 defaultClonePrice) ERC721(name, symbol) {
        _creator = msg.sender;
        creationTime = block.timestamp;
        description = _description;
        _defaultClonePrice = defaultClonePrice;
    }

    /**
     * @dev mints the NFT. Only the owner or approved minters can mint a token. The tokenURI is the metadata of the token. The url is the url of the bookmark.
     */
    function mintNFT(string memory _tokenURI, string memory _url) public {
        require(msg.sender == owner() || _approvedMinters[msg.sender], "Caller is not allowed to mint");
        _tokenIdCounter.increment();
        address owner = _msgSender();
        
        uint256 newTokenId = _tokenIdCounter.current();
        _safeMint(owner, newTokenId);
        _isClone[newTokenId] = false;
        _setTokenURI(newTokenId, _tokenURI);
        _urlToTokenId[_url].push(newTokenId);
        _ownedTokens[owner].push(newTokenId);
        _allTokens.push(newTokenId);
        _totalMintedOriginalTokens++;
        _idToCreator[newTokenId] = owner;
        _mintedTime[newTokenId] = block.timestamp;
        
    }
    /**
     * @dev Returns the total amount of tokens stored by the contract. A clone allows anyone to mint a token on a contract that is not theirs. However the contract owner gets to set the price of the clone.
     */
    function mintClone(uint256 tokenId, string memory _tokenURI, string memory _url) public payable {
        require(_exists(tokenId), "Invalid token ID");
        require(!_isClone[tokenId], "Cannot clone a clone");

        uint256 clonePrice = _clonePrice[tokenId] > 0 ? _clonePrice[tokenId] : _defaultClonePrice;
        require(msg.value >= clonePrice, "Insufficient funds to mint clone");

        _tokenIdCounter.increment();
        uint256 newTokenId = _tokenIdCounter.current();
        _safeMint(msg.sender, newTokenId);
        _isClone[newTokenId] = true;
        _cloneOf[newTokenId] = tokenId;
        _urlToTokenId[_url].push(newTokenId);
        // the clone still has a unique metadata info
        _setTokenURI(newTokenId, _tokenURI);
        // keep track of all clones of the original token
        _clonesOfOriginal[tokenId].push(newTokenId); 
        // keep track of all tokens owned by a given address
        _ownedTokens[msg.sender].push(newTokenId);
        // keep track of all tokens
        _allTokens.push(newTokenId);
        _totalMintedCloneTokens++;
        _idToCreator[newTokenId] = msg.sender;

        _mintedTime[newTokenId] = block.timestamp;
    }

     function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override {
        super._transfer(from, to, tokenId);
        // remove token from previous owner
        for (uint256 i = 0; i < _ownedTokens[from].length; i++) {
            if (_ownedTokens[from][i] == tokenId) {
                _ownedTokens[from][i] = _ownedTokens[from][_ownedTokens[from].length - 1];
                _ownedTokens[from].pop();
                break;
            }
        }
        // add token to new owner
        _ownedTokens[to].push(tokenId);
    }
    
    function getOwnedTokens(address owner, CloneFilter filter, string memory url) public view returns (uint256[] memory) {
        uint256[] memory ownedTokens = _ownedTokens[owner];
        uint256[] memory tokensByUrl = _urlToTokenId[url];

        return filterTokens(ownedTokens, filter, tokensByUrl, bytes(url).length > 0);
    }

    function getAllMintedTokens(CloneFilter filter, string memory url) public view returns (uint256[] memory) {
        uint256[] memory tokensByUrl = _urlToTokenId[url];

        return filterTokens(_allTokens, filter, tokensByUrl, bytes(url).length > 0);
    }

    function filterTokens(uint256[] memory tokens, CloneFilter filter, uint256[] memory tokensByUrl, bool filterByUrl) private view returns (uint256[] memory) {
        uint256 count = 0;
        
        // Count the tokens that meet the criteria
        for (uint i = 0; i < tokens.length; i++) {
            if (isValidToken(tokens[i], filter, tokensByUrl, filterByUrl)) {
                count++;
            }
        }
        
        // Populate the result array with the tokens that meet the criteria
        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        for (uint i = 0; i < tokens.length; i++) {
            if (isValidToken(tokens[i], filter, tokensByUrl, filterByUrl)) {
                result[index++] = tokens[i];
            }
        }
        
        return result;
    }

    function isValidToken(uint256 tokenId, CloneFilter filter, uint256[] memory tokensByUrl, bool filterByUrl) private view returns (bool) {
        bool isTokenClone = isClone(tokenId);
        bool cloneCondition = (filter == CloneFilter.OnlyClones && isTokenClone) || (filter == CloneFilter.NoClones && !isTokenClone) || (filter == CloneFilter.All);

        if (filterByUrl) {
            return cloneCondition && containsToken(tokensByUrl, tokenId);
        } else {
            return cloneCondition;
        }
    }

    function containsToken(uint256[] memory tokenArray, uint256 tokenId) private pure returns (bool) {
        for (uint j = 0; j < tokenArray.length; j++) {
            if (tokenId == tokenArray[j]) {
                return true;
            }
        }
        return false;
    }


    /**
     * @dev Returns all minted tokens
     * @return unint256 count of token IDs
     */
    function getTotalMintedTokens() public view returns (uint256) {
        return _totalMintedOriginalTokens + _totalMintedCloneTokens; 
    }

    /**
     * @dev Returns the total amount of minted original tokens
     * @return uint256 count of original token IDs
     */
    function getTotalMintOriginalTokens() public view returns (uint256) {
        return _totalMintedOriginalTokens;
    }

    /**
     * @dev Returns the total amount of minted clone tokens
     * @return uint256 count of clone token IDs
     */
    function getTotalMintClonedTokens() public view returns (uint256) {
        return _totalMintedCloneTokens;
    }

    /**
     * @dev Returns a boolean flag telling if the token is a clone
     * @param tokenId token ID
     * @return flag of the token
     */
    function isClone(uint256 tokenId) public view returns (bool) {
        return _isClone[tokenId];
    }

    /**
     * @dev Returns all clones of a given original token
     * @param tokenId original token ID
     * @return array of token IDs
     */
    function getClonesOfOriginal(uint256 tokenId) public view returns (uint256[] memory) {
        require(!_isClone[tokenId], "Token is a clone, not an original");
        return _clonesOfOriginal[tokenId];
    }

    /**
     * @dev Returns the original token of a given clone
     * @param tokenId clone token ID
     * @return original token ID
     */
    function getOriginal(uint256 tokenId) public view returns (uint256) {
        require(_isClone[tokenId], "Token is not a clone");
        return _cloneOf[tokenId];
    }
    /**
     * @dev Returns the creator of a given token
     * @param tokenId token ID
     * @return address of the creator
     */
    function getTokenCreator(uint256 tokenId) public view returns (address) {
        require(_exists(tokenId), "Token does not exist");
        return _idToCreator[tokenId];
    }

    /**
     * @dev Returns the creator of the contract
     * @return address of the creator
     */
    function getContractCreator() public view returns (address) {
        return _creator;
    }

    /**
     * @dev Returns the default clone price
     * @return default clone price
     */
    function getDefaultClonePrice() public view returns (uint256) {
        return _defaultClonePrice;
    }

    /**
     * @dev sets the clone price for a given token. If not set the default clone price is used
     * @param tokenId token ID
     * @param newPrice new clone price
     */
    function setClonePrice(uint256 tokenId, uint256 newPrice) public {
        require(msg.sender == owner() || _approvedMinters[msg.sender], "Caller is not contract or token owner");
        if (newPrice > 0) {
            _hasClonePrice[tokenId] = true;
            _clonePrice[tokenId] = newPrice;
        } else {
            _hasClonePrice[tokenId] = false;
            _clonePrice[tokenId] = 0;
        }
    }
    
    /**
     * @dev gets the clone price on the specific token
     * @param tokenId token ID
     * @return clone price
     */
    function getClonePrice(uint256 tokenId) public view returns (uint256) {
        return _clonePrice[tokenId];
    }

    /**
     * @dev gets a boolean flag if the clone price has been set. Used because the clone price could be set to 0 and 0 is also the value when its not set at all.
     * @param tokenId token ID
     * @return boolean flag
     */
    function getHasClonePrice(uint256 tokenId) public view returns (bool) {
        require(_exists(tokenId), "Token does not exist");
        return _hasClonePrice[tokenId];
    }

    function getMintedTime(uint256 tokenId) public view returns (uint) {
        require(_exists(tokenId), "Token does not exist");
        return _mintedTime[tokenId];
    }

   /**
    * @dev Returns the token ID for a given URL
    * @param _url URL of the tokens
    * @return uint256 array of token IDs
    */
    function getTokenIdByUrl(string memory _url) public view returns (uint256[] memory) {
        return _urlToTokenId[_url];
    }


    /**
     * internal override of the _burn function to update mappings
     * @param tokenId token ID
     */
    function _burn(uint256 tokenId) internal override(ERC721URIStorage) {
        address owner = ERC721.ownerOf(tokenId);

        // _beforeTokenTransfer(owner, address(0), tokenId, 1);

        // _approve(address(0), tokenId);
        super._burn(tokenId);

        // If this is a clone, remove it from the list of clones of the original token
        if (_isClone[tokenId]) {
            uint256 original = _cloneOf[tokenId];
            uint256[] storage clones = _clonesOfOriginal[original];
            for (uint256 i = 0; i < clones.length; i++) {
                if (clones[i] == tokenId) {
                    clones[i] = clones[clones.length - 1];
                    clones.pop();
                    break;
                }
            }
            delete _cloneOf[tokenId];
        } else {
            // If this is an original token, clear the list of its clones
            delete _clonesOfOriginal[tokenId];
        }

        // Clear other token metadata
        delete _isClone[tokenId];
        delete _clonePrice[tokenId];

         // Clean up creator mapping
        delete _idToCreator[tokenId];

        // finally, handle removal from _ownedTokens
        
        uint256[] storage ownedTokens = _ownedTokens[owner];
        for (uint256 i = 0; i < ownedTokens.length; i++) {
            if (ownedTokens[i] == tokenId) {
                ownedTokens[i] = ownedTokens[ownedTokens.length - 1];
                ownedTokens.pop();
                break;
            }
        }

        // clean up _allTokens
        for (uint256 i = 0; i < _allTokens.length; i++) {
            if (_allTokens[i] == tokenId) {
                _allTokens[i] = _allTokens[_allTokens.length - 1];
                _allTokens.pop();
                break;
            }
        }
    }

    /**
     * @dev A way for an owner to burn their token and remove it from the list of tokens
     * @param tokenId token ID
     */
    function burnToken(uint256 tokenId, string memory _url) public {
        // Only allow the owner of the token to burn it
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: caller is not owner nor approved");
        // @todo remove url from _urlToTokenId
        removeTokenFromURL(_url, tokenId);
        if (_isClone[tokenId]) {
            _totalMintedCloneTokens--;
        } else {
            _totalMintedOriginalTokens--;
        }
        _burn(tokenId);
    }

    /**
     * @dev removes the url from the mapping of url to token IDs. Used when a token is burned.
     * @param tokenId token ID
     */
    function removeTokenFromURL(string memory url, uint256 tokenId) internal {
        uint256[] storage tokenIds = _urlToTokenId[url];

        for (uint256 i = 0; i < tokenIds.length; i++) {
            if (tokenIds[i] == tokenId) {
                // Swap the element to be removed with the last element
                tokenIds[i] = tokenIds[tokenIds.length - 1];
                tokenIds.pop();
                break;
            }
        }
    }

    /**
     * a way to get the tokenURI of a token
     * @param tokenId token ID
     * @return string token URI, ipfs://<hash>
     */
    function tokenURI(uint256 tokenId) public view override(ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    /**
     *  @dev A way for the contract owner to withdraw any funds that have been sent to the contract
     */
    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    /**
     * @dev A way for the contract owner to updat e the description, approvedMintors, and clone price
     * @param _description the contract details
     * @param _newDefaultClonePrice the new defaultClonePrice
     * @param _minters the new list of approved minters
     */
    function updateContract(string memory _description, uint256 _newDefaultClonePrice, address[] memory _minters) public onlyOwner {
        description = _description;
        _defaultClonePrice = _newDefaultClonePrice;
            // Reset the minters array
        for (uint256 i = 0; i < minters.length; i++) {
            delete _approvedMinters[minters[i]];
        }
        minters = _minters;

        // Set the minters in the mapping
        for (uint256 i = 0; i < _minters.length; i++) {
            _approvedMinters[_minters[i]] = true;
        }
    }

    /**
     * @dev A way to see who is approved to mint tokens
     */
    function getApprovedMinters() public view returns (address[] memory) {
        return minters;
    }

}