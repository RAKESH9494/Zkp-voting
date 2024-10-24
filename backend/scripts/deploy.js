const hre = require("hardhat");
async function main() {
    const VerifierContract = await hre.ethers.getContractFactory("Groth16Verifier");
    const contract1 = await VerifierContract.deploy();
    const ArtGallery = await hre.ethers.getContractFactory("votingContract");
    const contract2 = await ArtGallery.deploy(contract1.target)
    console.log("The Verifire deployed at address : ",contract1.target)
    console.log("The Voting contract deployed at address : ",contract2.target)
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
