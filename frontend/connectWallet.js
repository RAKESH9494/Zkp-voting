// const ethers = require("ethers")
// const ethers = require("ethers")
const contractAddress = "0xcB14D82298Bf3c63d1216743b94FCA3281245D9d"; // Replace with your contract address
let contractABI;
const loadABI = async () => {
  try {
    const response = await fetch("../backend/artifacts/contracts/votingContract.sol/votingContract.json");
    const abiFile = await response.json();
    // console.log(response)
    contractABI = abiFile.abi; // Make sure you access the ABI field in the JSON
    // console.log("ABI Loaded:", contractABI);
  } catch (error) {
    console.error("Error loading ABI:", error);
  }
};


const connectWallet = async () => {
  try {
    const { ethereum } = window;
 
    await loadABI();

    if (ethereum) {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      const account = accounts[0];
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Get contract instance
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const formattedAccount = Web3.utils.toChecksumAddress(account.toLowerCase());
      return { contract, account :formattedAccount};
    } else {
      alert("Please install MetaMask");
      return null;
    }
  } catch (error) {
    console.error("Error connecting to wallet:", error);
    return null;
  }
};


const generateProof = async(input)=>{

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, "../backend/zkp_files/circuit_js/circuit.wasm", "../backend/zkp_files/circuit_final.zkey");

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

  return proofArgs;

}

window.onload = async () => {
  // Ensure the user has MetaMask or another Web3 wallet installed

  const { ethereum } = window;
 
  await loadABI();

  const wallet = await connectWallet();
  if (typeof window.ethereum !== 'undefined') {
      try {
          // Fetch vote counts for each contestant

          // the input contesent id is in poseidon hash formate.
          // The poseidon hash function provided by circomlibjs, which is not available in CDN formate. So I uses generated data.
          const votesA = await wallet.contract.getVoteInfo('18586133768512220936620570745912940619677854269274689475585506675881198879027'); 
          const votesB = await wallet.contract.getVoteInfo('8645981980787649023086883978738420856660271013038108762834452721572614684349'); 
          const votesC = await wallet.contract.getVoteInfo('6018413527099068561047958932369318610297162528491556075919075208700178480084'); 
          const votesD = await wallet.contract.getVoteInfo('9900412353875306532763997210486973311966982345069434572804920993370933366268'); 

          // Update the DOM with fetched votes
          document.querySelector("#votesOfContestent-1").innerHTML = `Votes : ${votesA.toString()}`
          document.querySelector("#votesOfContestent-2").innerHTML = `Votes : ${votesB.toString()}`
          document.querySelector("#votesOfContestent-3").innerHTML = `Votes : ${votesC.toString()}`
          document.querySelector("#votesOfContestent-4").innerHTML = `Votes : ${votesD.toString()}`

      } catch (error) {
          console.error('Error fetching votes:', error);
      }
  } else {
      console.log('Please install MetaMask');
  }
};

const getResults= async(voterContestent) =>{
  const wallet = await connectWallet();
  try{
    const tx = await wallet.contract.getVoteInfo(voterContestent);
    console.log(tx.toString())
  }catch(e){
    console.log(e);
  }

}

document.getElementById('voteForm').addEventListener('submit', async function (event) {
  event.preventDefault();  

  const wallet = await connectWallet();
  if (!wallet) return;

  // Show the modal
  const modal = document.getElementById('transactionModal');
  modal.style.display = 'block';

  // Get the age input value
  const age = document.getElementById('age').value;

  // Get the selected contestant value
  const selectedContestant = document.getElementById('contestant').value;

  var input = {
      ToWhomVote: +selectedContestant,
      Age: +age
  };

  try {
      // Generate ZKP proof
      const proofArgs = await generateProof(input);

      const tx = await wallet.contract.castVote(proofArgs.a, proofArgs.b, proofArgs.c, proofArgs.input);
      await tx.wait(); 

      // Close the modal
      modal.style.display = 'none';

      alert("Vote casted successfully!");
      window.location.reload();
  } catch (e) {
      // Close the modal in case of an error
      modal.style.display = 'none';

      alert(e.reason || "Error casting vote");
      console.log(e);
  }
});

