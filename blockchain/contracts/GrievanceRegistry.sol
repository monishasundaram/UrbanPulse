// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract GrievanceRegistry {

    struct Complaint {
        string complaintId;
        string evidenceHash;
        uint256 timestamp;
        string status;
        address filedBy;
    }

    mapping(string => Complaint) public complaints;
    string[] public complaintIds;

    event ComplaintFiled(
        string complaintId,
        string evidenceHash,
        uint256 timestamp,
        address filedBy
    );

    event ActionLogged(
        string complaintId,
        string action,
        uint256 timestamp,
        address officer
    );

    event StatusUpdated(
        string complaintId,
        string newStatus,
        uint256 timestamp
    );

    function fileComplaint(
        string memory _id,
        string memory _hash
    ) public {
        complaints[_id] = Complaint(
            _id,
            _hash,
            block.timestamp,
            "Filed",
            msg.sender
        );
        complaintIds.push(_id);
        emit ComplaintFiled(_id, _hash, block.timestamp, msg.sender);
    }

    function logAction(
        string memory _id,
        string memory _action
    ) public {
        emit ActionLogged(_id, _action, block.timestamp, msg.sender);
    }

    function updateStatus(
        string memory _id,
        string memory _status
    ) public {
        complaints[_id].status = _status;
        emit StatusUpdated(_id, _status, block.timestamp);
    }

    function getComplaint(
        string memory _id
    ) public view returns (Complaint memory) {
        return complaints[_id];
    }

    function getTotalComplaints() public view returns (uint256) {
        return complaintIds.length;
    }
}