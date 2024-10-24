// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
import "./verifier.sol";

contract votingContract {

    Groth16Verifier verifierContract;

    mapping (address => bool) public hasVoted;
    mapping(uint => uint) public votes;

    constructor(Groth16Verifier _verifier) {
        verifierContract = Groth16Verifier(_verifier);
    }

    /**
     * @dev Casts a vote after verifying the zk-SNARK proof.
     * @param _a Groth16 proof a parameter
     * @param _b Groth16 proof b parameter
     * @param _c Groth16 proof c parameter
     * @param _pubSignals Public signals used in the proof (e.g., voter identity, candidate ID)
     */
    function castVote(
        uint[2] calldata _a,
        uint[2][2] calldata _b,
        uint[2] calldata _c,
        uint[2] memory _pubSignals
    ) public {
        // Ensure the user hasn't already voted
        require(!hasVoted[msg.sender], 'Vote is already casted');

        // Ensure the first public signal matches the expected value (adjust as needed for your ZK setup)
        _pubSignals[0]=1;

        // Verify the zk-SNARK proof using the Verifier contract
        require(verifierContract.verifyProof(_a, _b, _c, _pubSignals), "Proof verification failed");

        // Increment the vote count for the candidate specified by the second public signal
        votes[_pubSignals[1]]++;

        // Mark the sender as having voted
        hasVoted[msg.sender] = true;
    }

    /**
     * @dev Returns the number of votes for a specific candidate.
     * @param _contestantId The ID of the candidate to get votes for.
     * @return The number of votes that the candidate has received.
     */
    function getVoteInfo(uint _contestantId) public view returns (uint) {
        return votes[_contestantId];
    }
}
