pragma solidity ^0.4.0;

contract BitEmail {
  struct EmailBid {
    address sender;
    string emailID;
    uint256 bid;
    uint expiry;
  }

  address public receiver;

  event BidEvent(
    address sender,
    string emailID,
    uint256 bid
  );

  event EmailReplied(
    string emailID
  );

  mapping(string => EmailBid) emailBids;

  function BitEmail() {
    receiver = msg.sender;
  }

  function checkExistingBid(string emailID) constant returns (bool) {
    EmailBid existing = emailBids[emailID];
    return sha3(existing.emailID) == sha3(emailID);
  }

  function makeEmailBid(string emailID, uint expiry) payable {
    if (checkExistingBid(emailID)) {
      throw;
    }
    emailBids[emailID] = EmailBid(msg.sender, emailID, msg.value, expiry);
    BidEvent(msg.sender, emailID, msg.value);
  }

  function cancelBid(string emailID) {
    if(!checkExistingBid(emailID)) {
       throw;
    }

    EmailBid emailBid = emailBids[emailID];
    if (msg.sender != emailBid.sender) {
       throw;
    }
    delete emailBids[emailID];
  }

  function onEmailReplied(string emailID) {
    if (!checkExistingBid(emailID)) {
      throw;
    }

    EmailBid emailBid = emailBids[emailID];
    uint256 bid = emailBid.bid;
    delete emailBids[emailID];
    receiver.transfer(bid);
    EmailReplied(emailID);
  }

}
