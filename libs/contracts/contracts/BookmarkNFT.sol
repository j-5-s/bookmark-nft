// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract BookmarkNFT is ERC721URIStorage, Ownable {
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
    mapping(string => uint256) private _urlToTokenId; 

    mapping(uint256 => address) private _idToCreator;
    address private _creator;
    // Keep track of all tokens owned by a given address   
    mapping(address => uint256[]) private _ownedTokens;

    //Keep track of all clones of a given original token     
    mapping(uint256 => uint256[]) private _clonesOfOriginal;
    
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

    function mintNFT(string memory _tokenURI, string memory _url) public {
        require(_urlToTokenId[_url] == 0, "URL already exists");
        require(msg.sender == owner() || _approvedMinters[msg.sender], "Caller is not allowed to mint");
        _tokenIdCounter.increment();
        address owner = _msgSender();
        
        uint256 newTokenId = _tokenIdCounter.current();
        _safeMint(owner, newTokenId);
        _isClone[newTokenId] = false;
        _setTokenURI(newTokenId, _tokenURI);
        _urlToTokenId[_url] = newTokenId;
        _ownedTokens[owner].push(newTokenId);
        _allTokens.push(newTokenId);
        _totalMintedOriginalTokens++;
        _idToCreator[newTokenId] = owner;
        
    }

    function mintClone(uint256 tokenId, string memory _tokenURI/* string memory _url*/) public payable {
        // clones should allow duplciates
        // require(_urlToTokenId[_url] == 0, "URL already exists");
        require(_exists(tokenId), "Invalid token ID");
        require(!_isClone[tokenId], "Cannot clone a clone");
        uint256 clonePrice = _clonePrice[tokenId] > 0 ? _clonePrice[tokenId] : _defaultClonePrice;
        require(msg.value >= clonePrice, "Insufficient funds to mint clone");

        _tokenIdCounter.increment();
        uint256 newTokenId = _tokenIdCounter.current();
        _safeMint(msg.sender, newTokenId);
        _isClone[newTokenId] = true;
        _cloneOf[newTokenId] = tokenId;
        // _urlToTokenId[_url] = newTokenId;
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

    function getOwnedTokens(address owner) public view returns (uint256[] memory) {
        return getOwnedTokens(owner, CloneFilter.All);
    }

    function getOwnedTokens(address owner, CloneFilter filter) public view returns (uint256[] memory) {

        uint256[] memory ownedTokens = _ownedTokens[owner];
        if (filter == CloneFilter.All) {
            return ownedTokens;
        } else {
            uint256 count = 0;
            for (uint i = 0; i < ownedTokens.length; i++) {
                bool isTokenClone = isClone(ownedTokens[i]);
                if ((filter == CloneFilter.OnlyClones && isTokenClone) || (filter == CloneFilter.NoClones && !isTokenClone)) {
                    count++;
                }
            }
            uint256[] memory result = new uint256[](count);
            uint256 index = 0;
            for (uint i = 0; i < ownedTokens.length; i++) {
                bool isTokenClone = isClone(ownedTokens[i]);
                if ((filter == CloneFilter.OnlyClones && isTokenClone) || (filter == CloneFilter.NoClones && !isTokenClone)) {
                    result[index] = ownedTokens[i];
                    index++;
                }
            }
            return result;
        }
    }

    function getAllMintedTokens() public view returns (uint256[] memory) {
        return getAllMintedTokens(CloneFilter.All);
    }

    function getAllMintedTokens(CloneFilter filter) public view returns (uint256[] memory) {
        uint256 count;
        for (uint i = 0; i < _allTokens.length; i++) {
            bool isTokenClone = isClone(_allTokens[i]);
            if ((filter == CloneFilter.All) || (filter == CloneFilter.OnlyClones && isTokenClone) || (filter == CloneFilter.NoClones && !isTokenClone)) {
                count++;
            }
        }
        uint256[] memory result = new uint256[](count);
        uint256 j = 0;
        for (uint i = 0; i < _allTokens.length; i++) {
            bool isTokenClone = isClone(_allTokens[i]);
            if ((filter == CloneFilter.All) || (filter == CloneFilter.OnlyClones && isTokenClone) || (filter == CloneFilter.NoClones && !isTokenClone)) {
                result[j++] = _allTokens[i];
            }
        }
        return result;
    }

    function getTotalMintedTokens() public view returns (uint256) {
        return _totalMintedOriginalTokens + _totalMintedCloneTokens; 
    }

    function getTotalMintOriginalTokens() public view returns (uint256) {
        return _totalMintedOriginalTokens;
    }

    function getTotalMintClonedTokens() public view returns (uint256) {
        return _totalMintedCloneTokens;
    }

    function isClone(uint256 tokenId) public view returns (bool) {
        return _isClone[tokenId];
    }

    // write a new function to get all clones of an original token
    function getClonesOfOriginal(uint256 tokenId) public view returns (uint256[] memory) {
        require(!_isClone[tokenId], "Token is a clone, not an original");
        return _clonesOfOriginal[tokenId];
    }

    function getOriginal(uint256 tokenId) public view returns (uint256) {
        require(_isClone[tokenId], "Token is not a clone");
        return _cloneOf[tokenId];
    }

    function getTokenCreator(uint256 tokenId) public view returns (address) {
        require(_exists(tokenId), "Token does not exist");
        return _idToCreator[tokenId];
    }

    function getContractCreator() public view returns (address) {
        return _creator;
    }

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
    
    function getClonePrice(uint256 tokenId) public view returns (uint256) {
        return _clonePrice[tokenId];
    }

    function getHasClonePrice(uint256 tokenId) public view returns (bool) {
        require(_exists(tokenId), "Token does not exist");
        return _hasClonePrice[tokenId];
    }

    function getDefaultClonePrice() public view returns (uint256) {
        return _defaultClonePrice;
    }

    function setDefaultClonePrice(uint256 newPrice) public onlyOwner {
        _defaultClonePrice = newPrice;
    }

    function getTokenIdByUrl(string memory _url) public view returns (uint256) {
        return _urlToTokenId[_url];
    }

    function burnToken(uint256 tokenId, string memory _url) public {
        // Only allow the owner of the token to burn it
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: caller is not owner nor approved");
        uint256 token = _urlToTokenId[_url];
        require(token == tokenId, "Token ID does not match URL");
        
        delete _urlToTokenId[_url];
        _burn(tokenId);
    }

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
        
        // @todo: clean up _urlToTokenId
        // assuming _urlToTokenId can be reversed to get URL by tokenId
        // string memory tokenUrl = getTokenUrlByTokenId(tokenId);
        // delete _urlToTokenId[tokenUrl];

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

    function tokenURI(uint256 tokenId) public view override(ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    function setDescription(string memory _description) public onlyOwner {
        description = _description;
    }

    function updateContract(string memory _description, uint256 _newPrice, address[] memory _minters) public onlyOwner {
        description = _description;
        _defaultClonePrice = _newPrice;
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

    function getApprovedMinters() public view returns (address[] memory) {
        return minters;
    }

}