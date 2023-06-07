export const contractText = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CloneableNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    uint256 private _defaultClonePrice = 0.01 ether;
    mapping(uint256 => bool) private _isClone;
    mapping(uint256 => uint256) private _cloneOf;
    mapping(uint256 => uint256) private _clonePrice;

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {
    }

    function mintOriginalNFT(string memory _tokenURI) public onlyOwner {
        _tokenIdCounter.increment();
        uint256 newTokenId = _tokenIdCounter.current();
        _mint(msg.sender, newTokenId);
        _isClone[newTokenId] = false;
        _setTokenURI(newTokenId, _tokenURI);
    }

    function mintClone(uint256 tokenId) public payable {
        require(_exists(tokenId), "Invalid token ID");
        require(!_isClone[tokenId], "Cannot clone a clone");
        uint256 clonePrice = _clonePrice[tokenId] > 0 ? _clonePrice[tokenId] : _defaultClonePrice;
        require(msg.value >= clonePrice, "Insufficient funds to mint clone");

        _tokenIdCounter.increment();
        uint256 newTokenId = _tokenIdCounter.current();
        _safeMint(msg.sender, newTokenId);
        _isClone[newTokenId] = true;
        _cloneOf[newTokenId] = tokenId;
    }

    function isClone(uint256 tokenId) public view returns (bool) {
        return _isClone[tokenId];
    }

    function getOriginal(uint256 tokenId) public view returns (uint256) {
        require(_isClone[tokenId], "Token is not a clone");
        return _cloneOf[tokenId];
    }

    function setClonePrice(uint256 tokenId, uint256 newPrice) public onlyOwner {
        _clonePrice[tokenId] = newPrice;
    }

    function getDefaultClonePrice() public view returns (uint256) {
        return _defaultClonePrice;
    }

    function setDefaultClonePrice(uint256 newPrice) public onlyOwner {
        _defaultClonePrice = newPrice;
    }

    function _burn(uint256 tokenId) internal override(ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
`;
