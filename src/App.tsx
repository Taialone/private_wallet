import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha512";
import { getParams } from "./helpers";
import { Elusiv, TokenType } from "@elusiv/sdk";
import "bootstrap/dist/css/bootstrap.min.css";
import {Button, Container} from "react-bootstrap";
import lodash from 'lodash';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import "bootstrap/dist/js/bootstrap.bundle.min.js";
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

// Add a recipient public key here
const recipient = new PublicKey("AAebd87P4WBMKr1VCbbwSZrYEnfMjxGQNfvFcZXW1Jsg");

const App = () => {
  const [balance, setBalance] = useState(BigInt(0));
  const [isLoading, setIsLoading] = useState(true);
  const [elusiv, setElusiv] = useState<Elusiv>(null);
  const [keyPair, setKeyPair] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [connection, setConnection] = useState(null);
  const [isSending, setIsSending] = useState(false);
  useEffect(() => {
    const setParams = async () => {
      const { elusiv: e, keyPair: kp, connection: conn } = await getParams();
      setElusiv(e);
      setKeyPair(kp);
      setConnection(conn);
	    toast.info("Private Wallet");
      setIsLoading(false);
    };

    setParams();
  }, []);

  const topup = async (
    elusivInstance: Elusiv,
    keyPair: Keypair,
    amount: number,
    tokenType: TokenType
  ) => {
    // Build our topup transaction
    const topupTx = await elusivInstance.buildTopUpTx(amount, tokenType);
    // Sign it (only needed for topups, as we're topping up from our public key there)
    topupTx.tx.partialSign(keyPair);
    // Send it off
    return elusivInstance.sendElusivTx(topupTx);
  };

  const send = async (
    elusivInstance: Elusiv,
    recipient: PublicKey,
    amount: number,
    tokenType: TokenType
  ) => {
    // Build the send transaction
    const sendTx = await elusivInstance.buildSendTx(
      amount,
      recipient,
      tokenType
    );
    // Send it off!
    return elusivInstance.sendElusivTx(sendTx);
  };

  useEffect(() => {
    const getBalance = async () => {
	  toast.info("Fetching private balance...");
      const privateBalance = await elusiv.getLatestPrivateBalance("LAMPORTS");
	  toast.success("Fetched private balance!");
      setBalance(privateBalance);
      setFetching(false);
    };

    if (elusiv !== null) {
      getBalance().then(() => toast.success("Balance updated"));
    }
  }, [elusiv]);

  const topupHandler = async (e) => {
    e.preventDefault();
    toast.info("Initiating topup...");
    const sig = await topup(
      elusiv,
      keyPair,
      LAMPORTS_PER_SOL,
      "LAMPORTS"
    );
    toast.success(`Topup complete with sig ${sig.signature}`);
  };

  const sendHandler = async (e) => {
    e.preventDefault();
	setIsSending(true);
    if (balance > BigInt(0)) {
		// Send half a SOL
		toast.info("Sending...");
		const sig = await send(
			elusiv,
			recipient,
			0.5 * LAMPORTS_PER_SOL,
			"LAMPORTS"
		);
		toast.success(`Send complete with sig ${sig.signature}`);
	}
  };
  return (
  
    <>
      <Nav className="justify-content-end" activeKey="/home">
        <Nav.Item>
          <Nav.Link href="/home">Active</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="link-1">Link</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="link-2">Link</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="disabled" disabled>
            Disabled
          </Nav.Link>
        </Nav.Item>
      </Nav>
      <link rel="shortcut icon" href="images/favicon.png" type="image/x-icon" />
        <link rel="icon" href="images/favicon.png" type="image/x-icon" />
        {/* <link href="css/style.css" rel="stylesheet" /> */}
<Container className="mt-3">
<Row className="justify-content-md-center">
        <Col xs lg="2">
          1 of 3
        </Col>
        <Col md="auto">
        <form style={{ width: 480, paddingLeft: 45 }}>
      <div className="mb-3">
      <label className="mt-3 " style={{ color: "black", fontSize: 20 }}>
        Connected to {isLoading ? "Loading..." : lodash.take(keyPair?.publicKey.toString(), 3)}
        </label>
        <label style={{ paddingLeft: 220 }}>icon</label>
      </div>
      <div className="mb-3">
        <div
          className="input-with-select"
          style={{
            width: 400,
            border: "0.5px gray solid",
            borderRadius: 5,
            backgroundColor: "azure"
          }}
        >
          <input
            className="inp"
            type="text"
            style={{ color: "black" }}
          />
          <div>
            <div
              className="btn "        >
              SOL
            </div>
           
          </div>
        </div>
      </div>
      <div className="mb-3">
        <label htmlFor="exampleInputPassword1" className="form-label">
          Private balance:  {fetching ? "Loading..." : `${Number(balance) / LAMPORTS_PER_SOL} SOL`}

        </label>
        <label style={{ paddingLeft: 15 }}>
          <button
            style={{ color: "black", borderRadius: 5 }}
            className="btn btn-secondary justify-content-between" onClick={(e) => topupHandler(e)} disabled={isLoading}
          >
            Top up
          </button>
        </label>
      </div>
      <div className="mb-3">
        <div className="input-with-select" style={{ backgroundColor: "azure" }}>
          <input
            type="text"
            placeholder="Recipient's address"
            style={{
              width: 400,
              height: 45,
              borderRadius: 5,
              border: "0.5px gray solid"
            }}
          />
        </div>
      </div>
     
      <button
        type="submit"
        className="btn mb-3  "
        style={{ backgroundColor: "rgb(75, 96, 139)", width: 400, height: 45 }}
        onClick={(e) => sendHandler(e)} disabled={isLoading || balance <= 0 || isSending}>
        Send
      </button>
    </form>
        </Col>
        <Col xs lg="2">
          3 of 3
        </Col>
      </Row>     

</Container>
    
<script src="plugins/jQuery/jquery.min.js"></script>
    <script src="js/script.js"></script>
      {/* <h1 className="display-6">Private Wallet</h1>
      <p>
        Connected to {isLoading ? "Loading..." : keyPair?.publicKey.toString()}
      </p>
  
      <p className="fs-5"> 
        Private Balance:{" "}
        {fetching ? "Loading..." : `${Number(balance) / LAMPORTS_PER_SOL} SOL`}
      </p>
      <Button variant="primary" onClick={(e) => topupHandler(e)} disabled={isLoading}> 
        Topup
      </Button> {" "}
      <Button variant="secondary" onClick={(e) => sendHandler(e)} disabled={isLoading || balance <= 0 || isSending}>
        Send
      </Button> */}
	 
    
    </>
  );
};

export default App;
