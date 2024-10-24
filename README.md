## Overview
zkpVoting leverages the power of Zero-Knowledge Proofs to create a private, decentralized voting system. By using ZKPs, voters can prove that they are eligible to vote without revealing their identity or which option they selected. The system guarantees that votes are counted correctly without compromising voter privacy.

## Features
- **Privacy-Preserving Voting:** Ensures that votes remain confidential using ZKPs.
- **Verifiability:** Anyone can verify that votes were cast and counted without knowing individual votes.
- **Decentralized:** Built on blockchain technology for transparency and immutability.
- **Anonymous Voting:** Voters remain completely anonymous while casting their votes.
- **Age is not known :** The age of the user remains hidden and verified using circuit file. 
- **Tamper-Proof:** Once a vote is cast, it cannot be altered or tampered with.

## Technology Stack
- **Smart Contract:** Solidity
- **Zero-Knowledge Proofs:** Circom, SnarkJS, Groth16
- **Frontend:** HTML, JavaScript, CSS.
- **Blockchain:** Ethereum Holesky test network.
- **Testing:** Hardhat.



## Smart Contract Details

The zkpVoting smart contract handles the following functions:
- **Voting:** Eligible users cast their vote, which is recorded on-chain without revealing their choice.
- **Tallying:** The system tallies the votes in a verifiable yet private manner( using ZKP verifier).

## Circute details
-**Voting:** Eligible users cast their vote through a zero-knowledge proof (ZKP) that proves their eligibility and vote validity without revealing their actual vote. The vote is recorded on-chain as a hashed value, ensuring that the voter's choice remains private.

-**Tallying:** The system securely tallies the votes using a ZKP verifier, which ensures that only valid votes are counted. The tallied results are publicly verifiable, but the individual votes remain private, preserving the anonymity of voters.


## Zero-Knowledge Proof (ZKP) Implementation

zkpVoting uses Zero-Knowledge Proofs to ensure the privacy of voters. The Circom circuits define the proof logic, while SnarkJS is used to generate and verify the proofs. Here’s a flow of how ZKPs are used:

1. **Circuit Definition:** Circom is used to create circuits for proving eligibility and vote casting.
2. **Proof Generation:** Users generate ZKPs locally to prove their vote.
3. **Verification:** The smart contract verifies the ZKP without revealing any vote details.
4. **Result Calculation:** The votes are tallied while keeping individual votes anonymous.


## Installation

To set up the project locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/zkpVoting.git
   cd zkpVoting
   ```
2. **Setup your creds:**

     open `.env` file and set your credentials.Those are `privatekey` and `API-Key`.

3. **Compile the smart contracts:**
     Navigate to backend in terminal. Run the command
   ```bash
   npx hardhat compile
   ```

4. **Deploy the smart contracts:**
   ```bash
   npx hardhat run scripts/deploy.js
   ```
  Copy the voting contract address and past at `connetWallet.js` in frontend folder.

5. **Run the frontend:**
  Note : Please install the metamask before and connects to the Holesky tesent.
  Navigate to frotend folder and open index.html



# How to generate .wasm, .zkey and verifier.sol file

1. Open `./backend/zkp_files` in terminal. Now run the below commands one by one

```bash

snarkjs powersoftau new bn128 14 pot14_0000.ptau -v
snarkjs powersoftau contribute pot14_0000.ptau pot14_0001.ptau --name="First contribution" -v
snarkjs powersoftau contribute pot14_0001.ptau pot14_0002.ptau --name="Second contribution" -v -e="some random text"

snarkjs powersoftau export challenge pot14_0002.ptau challenge_0003
snarkjs powersoftau challenge contribute bn128 challenge_0003 response_0003 -e="some random text"
snarkjs powersoftau import response pot14_0002.ptau response_0003 pot14_0003.ptau -n="Third contribution name"



snarkjs powersoftau verify pot14_0003.ptau
snarkjs powersoftau beacon pot14_0003.ptau pot14_beacon.ptau 0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f 10 -n="Final Beacon"
snarkjs powersoftau prepare phase2 pot14_beacon.ptau pot14_final.ptau -v
snarkjs powersoftau verify pot14_final.ptau




circom --r1cs --wasm --c --sym --inspect circuit.circom
snarkjs r1cs info circuit.r1cs
snarkjs r1cs print circuit.r1cs circuit.sym
snarkjs r1cs export json circuit.r1cs circuit.r1cs.json
cat circuit.r1cs.json

cat <<EOT > input.json
{"ToWhomVote": "3", "Age": "11"}
EOT

snarkjs wtns calculate circuit_js/circuit.wasm input.json witness.wtns

snarkjs wtns check circuit.r1cs witness.wtns


snarkjs groth16 setup circuit.r1cs pot14_final.ptau circuit_0000.zkey
snarkjs zkey contribute circuit_0000.zkey circuit_0001.zkey --name="1st Contributor Name" -v
snarkjs zkey contribute circuit_0001.zkey circuit_0002.zkey --name="Second contribution Name" -v -e="Another random entropy"



snarkjs zkey export bellman circuit_0002.zkey  challenge_phase2_0003
snarkjs zkey bellman contribute bn128 challenge_phase2_0003 response_phase2_0003 -e="some random text"
snarkjs zkey import bellman circuit_0002.zkey response_phase2_0003 circuit_0003.zkey -n="Third contribution name"



snarkjs zkey verify circuit.r1cs pot14_final.ptau circuit_0003.zkey
snarkjs zkey beacon circuit_0003.zkey circuit_final.zkey 0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f 10 -n="Final Beacon phase2"
snarkjs zkey verify circuit.r1cs pot14_final.ptau circuit_final.zkey
snarkjs zkey export verificationkey circuit_final.zkey verification_key.json
snarkjs groth16 prove circuit_final.zkey witness.wtns proof.json public.json
snarkjs groth16 fullprove input.json ./circuit_js/circuit.wasm circuit_final.zkey proof.json public.json
snarkjs groth16 verify verification_key.json public.json proof.json
snarkjs zkey export solidityverifier circuit_final.zkey verifier.sol
snarkjs zkey export soliditycalldata public.json proof.json


```

2. After the `verifier.sol` is generated (from your Circom or ZK-SNARK process), move it to the `contracts` folder in your backend directory. This folder will house all your Solidity contracts.

3. You need to hardcode the voting contract to integrate with the verifier. The verifier will take the proof and public signals and verify if the proof is correct. Here are the key points for the contract logic:

   - **Verifier checks proof and public signals:**  
     The `verifier.sol` should be invoked to take the zero-knowledge proof and the public signals (pub signals). It should return `true` if the proof is valid based on the public signals; otherwise, it returns `false`.

   - **Ensure public signals are correct:**  
     Your voting contract will only accept and process proofs that are verified as correct. You will hardcode logic to ensure that the public signals remain constant, specifically, the first public signal (`pubSignals[0]`) should always be `0` to pass the correct proof.

Here's a refined snippet of what the logic could look like in Solidity for your voting contract:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./verifier.sol";  // Import the verifier contract

contract zkpVoting {
    Verifier verifier;

    constructor(address _verifierAddress) {
        verifier = Verifier(_verifierAddress);  // Set the verifier contract address
    }

    function verifyProof(
        uint256[] memory proof, 
        uint256[] memory pubSignals
    ) public view returns (bool) {

        // Hardcoded here
        // Ensure the first public signal is always '0'
        require(pubSignals[0] == 0, "Public signal 0 must be constant and equal to 0");
        
        // Use the verifier contract to check proof validity
        bool proofValid = verifier.verifyProof(proof, pubSignals);
        require(proofValid, "Invalid proof");

        return true;  // Return true only if the proof is valid and public signals are correct
    }
}
```

#### For the commands expalantion, navigate to the `./backend/Commands.md`

## Links

Deployed At : https://holesky.etherscan.io/address/0xcb14d82298bf3c63d1216743b94fca3281245d9d
