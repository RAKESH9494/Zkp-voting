
const { expect } = require("chai");
const { ethers } = require("hardhat");
const snarkjs = require("snarkjs");

const { buildPoseidon } = require("circomlibjs");

describe('votingContrat', function(){


    
    let verifierContract;
    let votingContract;

    beforeEach(async function (){

        [addr1, addr2] = await ethers.getSigners();
        poseidon = await buildPoseidon(); 



    
        const verifier = await ethers.getContractFactory("Groth16Verifier");
        verifierContract  = await verifier.deploy();
        await verifierContract.waitForDeployment();


        const voting = await ethers.getContractFactory("votingContract");
        votingContract = await voting.deploy(verifierContract.getAddress());
        await votingContract.waitForDeployment();


    })

    it("Shoud be able to vote",async function(){

        const input ={
            ToWhomVote:2,
            Age:18
        }

        const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, "./zkp_files/circuit_js/circuit.wasm", "./zkp_files/circuit_final.zkey");
        const calldata = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);

        const argv = calldata
        .replace(/["[\]\s]/g, "")
        .split(',')
        .map(x => BigInt(x).toString());

        const proofArgs = {
            a: [argv[0], argv[1]],
            b: [[argv[2], argv[3]], [argv[4], argv[5]]],
            c: [argv[6], argv[7]],
            input: argv.slice(8)
        };
        await votingContract.connect(addr1).castVote(proofArgs.a,proofArgs.b,proofArgs.c,proofArgs.input);
        const data = await votingContract.getVoteInfo(poseidon.F.toString(poseidon([2])))
        expect(data.toString()).to.equal('1');
    })

    it("Should not cast multiple votes with single account",async function (){
        const input ={
            ToWhomVote:2,
            Age:18
        }

        const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, "./zkp_files/circuit_js/circuit.wasm", "./zkp_files/circuit_final.zkey");
        const calldata = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);

        const argv = calldata
        .replace(/["[\]\s]/g, "")
        .split(',')
        .map(x => BigInt(x).toString());

        const proofArgs = {
            a: [argv[0], argv[1]],
            b: [[argv[2], argv[3]], [argv[4], argv[5]]],
            c: [argv[6], argv[7]],
            input: argv.slice(8)
        };
        await votingContract.connect(addr1).castVote(proofArgs.a,proofArgs.b,proofArgs.c,proofArgs.input);

        expect(votingContract.connect(addr1).castVote(proofArgs.a,proofArgs.b,proofArgs.c,proofArgs.input)).to.be.revertedWith("vote is already casted");

    })

    it("Should not eligible to cast vote is age is under 18",async function (){
        const input ={
            ToWhomVote:2,
            Age:17
        }

        const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, "./zkp_files/circuit_js/circuit.wasm", "./zkp_files/circuit_final.zkey");
        const calldata = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);

        const argv = calldata
        .replace(/["[\]\s]/g, "")
        .split(',')
        .map(x => BigInt(x).toString());

        const proofArgs = {
            a: [argv[0], argv[1]],
            b: [[argv[2], argv[3]], [argv[4], argv[5]]],
            c: [argv[6], argv[7]],
            input: argv.slice(8)
        };
        expect(votingContract.connect(addr1).castVote(proofArgs.a,proofArgs.b,proofArgs.c,proofArgs.input)).to.be.revertedWith('Proof verification failed');

    })

})