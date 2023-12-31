import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import React, { useEffect, useState } from "react";
import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha512";
import { getParams } from "./helpers";
import { Elusiv, TokenType } from "@elusiv/sdk";
import './index.css';
import { toast, ToastContainer } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import { Toast, Button, Container } from "react-bootstrap";
import lodash from 'lodash';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));
// Add a recipient public key here
const recipient = new PublicKey("3iz4G6o5Zh7qyJbSHmmgpyUchnMBUYWrzVpLTMdW5GWE");

const App = () => {
  const [balance, setBalance] = useState(BigInt(0));
  const [isLoading, setIsLoading] = useState(true);
  const [elusiv, setElusiv] = useState<Elusiv>(null);
  const [keyPair, setKeyPair] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [connection, setConnection] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const showToast = (message, type) => {
    // Sử dụng React Bootstrap Toast để hiển thị thông báo
    switch (type) {
      case "info":
        toast.info(message);
        break;
      case "success":
        toast.success(message);
        break;
      case "error":
        toast.error(message);
        break;
      // Các loại thông báo khác (warning, danger, v.v.) có thể được xử lý tương tự
      default:
        toast(message);
    }
  };
  useEffect(() => {
    const setParams = async () => {
      const { elusiv: e, keyPair: kp, connection: conn } = await getParams();
      setElusiv(e);
      setKeyPair(kp);
      setConnection(conn);
      showToast("Private Wallet", "info");
      console.log()
      setIsLoading(false);
    };

    setParams();
  }, []);
  useEffect(() => {
    const getBalance = async () => {
      toast.info("Fetching private balance...");
      const privateBalance = await elusiv.getLatestPrivateBalance("LAMPORTS");
      showToast("Fetched private balance!", "success");
      setBalance(privateBalance);
      setFetching(false);
    };

    if (elusiv !== null) {
      getBalance().then(() => showToast("Balance updated", "success"));
    }
  }, [elusiv]);

  const topupHandler = async (e) => {
    e.preventDefault();
    showToast("Initiating topup...", "info");
    const sig = await topup(
      elusiv,
      keyPair,
      LAMPORTS_PER_SOL,
      "LAMPORTS"
    );
    showToast(`Topup complete with sig ${sig.signature}`, "success");
    console.log(`Topup complete with sig ${sig.signature}`);
  };

  const sendHandler = async (e) => {
    e.preventDefault();
    setIsSending(true);
    if (balance > BigInt(0)) {
      // Send half a SOL
      showToast("Sending...", "info");
      const sig = await send(
        elusiv,
        recipient,
        0.5 * LAMPORTS_PER_SOL,
        "LAMPORTS"
      );
      showToast(`Send complete with sig ${sig.signature}`, "success");
      console.log(`Send complete with sig ${sig.signature}`);
    }
  };
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


  return (

    <>

      <link rel="shortcut icon" href="images/favicon.png" type="image/x-icon" />
      <link rel="icon" href="images/favicon.png" type="image/x-icon" />
      {/* <link href="css/style.css" rel="stylesheet" /> */}
      <ToastContainer />
      <Container style={{ paddingTop: "20px" }}>
        <Row className="">

          <Col xs lg="2" >


            <div className="font-weight-bold " style={{ marginTop: "60px" }}><a
              href="#"
              style={{
                textDecoration: "none",
                color: isLoading ? "gray" : "white",
              }}
              onMouseEnter={e => {
                const target = e.target as HTMLAnchorElement;
                target.style.color = "gray";
              }}
              onMouseLeave={e => {
                const target = e.target as HTMLAnchorElement;
                target.style.color = isLoading ? "gray" : "white";
              }}
            > Connected to {isLoading ? "Loading..." : lodash.take(keyPair?.publicKey.toString(), 3)}
              &nbsp; . . .</a></div>
            <div className="font-weight-bold mt-4"  ><a href="#" className="hover-link" style={{
              textDecoration: "none",
              color: isLoading ? "gray" : "white",
            }}
              onMouseEnter={e => {
                const target = e.target as HTMLAnchorElement;
                target.style.color = "gray";
              }}
              onMouseLeave={e => {
                const target = e.target as HTMLAnchorElement;
                target.style.color = isLoading ? "gray" : "white";
              }}>About</a></div>
            <div className="font-weight-bold mt-4" ><a href="#" className="hover-link" style={{
              textDecoration: "none",
              color: isLoading ? "gray" : "white",
            }}
              onMouseEnter={e => {
                const target = e.target as HTMLAnchorElement;
                target.style.color = "gray";
              }}
              onMouseLeave={e => {
                const target = e.target as HTMLAnchorElement;
                target.style.color = isLoading ? "gray" : "white";
              }}>Contact</a></div>

          </Col>
          <Col md="auto" style={{ paddingLeft: "250px" }}>
            <form style={{ width: 480, height: 320, paddingLeft: "40px", backgroundColor: "white", borderRadius: "5px" }}>

              <div className="mb-3 pt-5 ">
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
                <div className="input-with-select" style={{ backgroundColor: "" }}>
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
