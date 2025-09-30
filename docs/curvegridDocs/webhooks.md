Webhooks
Webhooks send a notification about a blockchain event occurring to a configurable HTTP endpoint.

webhooks

Currently, MultiBaas supports two kinds of blockchain event notifications:

transaction.included: Any Cloud Wallet transaction has been included in a block on the blockchain.
event.emitted: A smart contract event has been emitted for any smart contract that has sync events enabled.
webhooks-page

Create new webhook
To access MultiBaas Webhooks, in the Navigation bar, go on Blockchain and then click on Webhooks. Click on the plus button in the top left corner to create a new webhook.

webhooks-create

Fill in the required inputs:

Label: A label to help you identify your webhook
Enter Endpoint URL: The URL for your endpoint.
transaction.included: Webhook triggers when the transaction is included in a block
event.emitted: Webhook triggers when the event is emitted
Finally, click on Add Endpoint.

Edit webhook
webhooks-edit

Choose a webhook you want to edit from the side menu
Click on the pen button besides its name in the top right corner of the page
Apply desired changes and click on Update.
Delete webhook
webhooks-delete

Choose a webhook you want to delete from the side menu
Click on the trash bin button besides its name in the top right corner of the page
Confirm by clicking on Delete button
Receving and validating a webhook
When a subscribed blockchain event occurs, MultiBaas will connect to the HTTP endpoint (server) that you specify and send the data in a JSON format specified below. For security, we recommend you use a secure connection (HTTPS/TLS).

Data structure
The HTTP body contains a JSON array of blockchain events, in the following format:

[
  {
    "id": "<event identifier>",
    "event": "<transaction.included|event.emitted>"
    "data": {}
  }
]

The data value will be according to the type of event that was emitted:

transaction.included: The same format as returned by the transaction receipt endpoint
event.emitted: The same format as returned by the list events API endpoint
Validating the data
Since the endpoint is open to the public Internet, it is critical to validate that any requests made to the endpoint did indeed come from MultiBaas. MultiBaas will send a timestamp and a signature of the request body plus the timestamp, as HTTP headers. The X-MultiBaas-Signature header contains the HMAC (Hash-based Message Authentication Code) signature, and the X-MultiBaas-Timestamp header holds the timestamp.

The HMAC signature is generated based on the request body data combined with a timestamp and a secret key. The HMAC algorithm uses the SHA-256 hashing function and the provided secret key to create a unique signature for the combination of the request's body and the timestamp.

The following pseudo-code and explanatory steps detail the process to validate the request body vs. the signature.

// addHMACSignature adds a timestamped HMAC signature to the given request's headers
func addHMACSignature(req *http.Request, jsonBody []byte, secret string) {
    HMACSignature := NewHMACSignature(jsonBody, time.Now().Unix(), secret)

    req.Header.Set("X-MultiBaas-Signature", HMACSignature.Signature)
    req.Header.Set("X-MultiBaas-Timestamp", HMACSignature.Timestamp)
}

// HMACSignature represents an HMAC signature and its timestamp
type HMACSignature struct {
    Signature string
    Timestamp string
}

// NewHMACSignature creates an HMAC signature form the given data, timestamp and secret.
func NewHMACSignature(data []byte, timestamp int64, secret string) HMACSignature {
    timestampStr := strconv.FormatInt(timestamp, 10)

    // The message is the data + timestamp (as a decimal string)
    mac := hmac.New(sha256.New, []byte(secret))
    mac.Write(data)
    mac.Write([]byte(timestampStr))
    signature := hex.EncodeToString(mac.Sum(nil))

    return HMACSignature{signature, timestampStr}
}

Step 1: Extract the timestamp and signatures from the header:
The addHMACSignature function sets the generated HMAC signature (HMACSignature.Signature) and the timestamp (HMACSignature.Timestamp) in the HTTP request's headers: "X-MultiBaas-Signature" and "X-MultiBaas-Timestamp" respectively.

Step 2: Prepare the signed_payload string:
The NewHMACSignature function generates a signature based on the combination of the provided data, timestamp, and secret key. This process effectively creates a signed payload by concatenating the data and the timestamp (both as strings) to produce a combined message used for creating the HMAC signature.

Step 3: Determine the expected signature:
The NewHMACSignature function uses the HMAC algorithm (SHA256 hash function) with the provided secret key to create a unique signature from the combination of the data and the timestamp.

Step 4: Compare the signatures:
The addHMACSignature function sets the generated signature and timestamp in the request headers. These values can be accessed later for comparison in a separate verification process within another function.

To perform a signature verification process, you'll need another function that fetches the X-MultiBaas-Signature and X-MultiBaas-Timestamp headers, uses the received timestamp and signature(s) for comparison, and conducts the steps outlined earlier for manual verification of signatures.

Sample webhook data for a transaction.included event type
Headers
User-Agent: Go-http-client/1.1
Content-Length: 974
Content-Type: application/json
X-Multibaas-Signature: 50942fdcec1b92fc9de6319d9c8495d335b0c796b7c8ef9c55e32a985e2afe4a
X-Multibaas-Timestamp: 1699582292
Accept-Encoding: gzip

POST body
[
  {
    "id": "f04c3919-120b-46ff-8766-85c3d0a081b6",
    "event": "transaction.included",
    "data": {
      "tx": {
        "type": "0x2",
        "chainId": "0x64f6",
        "nonce": "0x1",
        "to": "0x9dee62d32898b37f2bdf7e7cb1fa16a45d31d67a",
        "gas": "0x9ba9",
        "gasPrice": null,
        "maxPriorityFeePerGas": "0xa2d21d6e",
        "maxFeePerGas": "0xcc755c72",
        "value": "0x0",
        "input": "0xa0712d68000000000000000000000000000000000000000000000000000000000001e240",
        "accessList": [],
        "v": "0x1",
        "r": "0x17263ca900aefbce647e11a35d105f07fdb2075ffa5a63beb2b2f07e23102b1c",
        "s": "0x5b0158f62f60902f86fb2e83f6ca824030cf0709277b9436637da62e9874da70",
        "yParity": "0x1",
        "hash": "0xe6136095471608942dda7f20b81b8a92c3bbb733ff4e6cb2960e6b457e1e14b2"
      },
      "status": "included",
      "from": "0xf9450d254a66ab06b30cfa9c6e7ae1b7598c7172",
      "failed": false,
      "blockNumber": 10,
      "blockHash": "0xa63e7d8463ca0d1285fc0585529edff5527821ec5d30d679d7a9496fe67563ec",
      "resubmissionAttempts": 0,
      "successfulResubmissions": 0,
      "createdAt": "2023-11-10T11:11:30.755733+09:00",
      "updatedAt": "2023-11-10T02:11:32.82265Z"
    }
  }
]


Sample webhook data for an event.emitted event type
Headers
User-Agent: Go-http-client/1.1
Content-Length: 3749
Content-Type: application/json
X-Multibaas-Signature: ddeac03177be7b17d08dad736b2817a584149b9bc44571f72d8121c8818068e5
X-Multibaas-Timestamp: 1699582290
Accept-Encoding: gzip

Body
[
  {
    "id": "952699ad-717c-413c-ab58-0c779fa2fffc",
    "event": "event.emitted",
    "data": {
      "triggeredAt": "2023-11-10T11:11:30+09:00",
      "event": {
        "name": "Mint",
        "signature": "Mint(address,address,uint256)",
        "inputs": [
          {
            "name": "minter",
            "value": "0xF9450D254A66ab06b30Cfa9c6e7AE1B7598c7172",
            "hashed": false,
            "type": "address"
          },
          {
            "name": "receiver",
            "value": "0xF9450D254A66ab06b30Cfa9c6e7AE1B7598c7172",
            "hashed": false,
            "type": "address"
          },
          {
            "name": "value",
            "value": "123.456",
            "hashed": false,
            "type": "uint256"
          }
        ],
        "rawFields": "{\"address\":\"0x9dee62d32898b37f2bdf7e7cb1fa16a45d31d67a\",\"topics\":[\"0xab8530f87dc9b59234c4623bf917212bb2536d647574c8e7e5da92c2ede0c9f8\",\"0x000000000000000000000000f9450d254a66ab06b30cfa9c6e7ae1b7598c7172\",\"0x000000000000000000000000f9450d254a66ab06b30cfa9c6e7ae1b7598c7172\"],\"data\":\"0x000000000000000000000000000000000000000000000000000000000001e240\",\"blockNumber\":\"0xa\",\"transactionHash\":\"0xe6136095471608942dda7f20b81b8a92c3bbb733ff4e6cb2960e6b457e1e14b2\",\"transactionIndex\":\"0x0\",\"blockHash\":\"0xa63e7d8463ca0d1285fc0585529edff5527821ec5d30d679d7a9496fe67563ec\",\"logIndex\":\"0x0\",\"removed\":false}",
        "contract": {
          "address": "0x9deE62D32898B37F2BDf7e7cB1FA16a45D31D67a",
          "addressLabel": "autotoken",
          "name": "MltiToken",
          "label": "mltitoken"
        },
        "indexInLog": 0
      },
      "transaction": {
        "from": "0xF9450D254A66ab06b30Cfa9c6e7AE1B7598c7172",
        "txData": "0xa0712d68000000000000000000000000000000000000000000000000000000000001e240",
        "txHash": "0xe6136095471608942dda7f20b81b8a92c3bbb733ff4e6cb2960e6b457e1e14b2",
        "txIndexInBlock": 0,
        "blockHash": "0xa63e7d8463ca0d1285fc0585529edff5527821ec5d30d679d7a9496fe67563ec",
        "blockNumber": 10,
        "contract": {
          "address": "0x9deE62D32898B37F2BDf7e7cB1FA16a45D31D67a",
          "addressLabel": "autotoken",
          "name": "MltiToken",
          "label": "mltitoken"
        },
        "method": {
          "name": "mint",
          "signature": "mint(uint256)",
          "inputs": [
            {
              "name": "_amount",
              "value": "123.456",
              "type": "uint256"
            }
          ]
        }
      }
    }
  },
  {
    "id": "78274107-0db5-4c02-b80e-eff6430a4cc3",
    "event": "event.emitted",
    "data": {
      "triggeredAt": "2023-11-10T11:11:30+09:00",
      "event": {
        "name": "Transfer",
        "signature": "Transfer(address,address,uint256)",
        "inputs": [
          {
            "name": "from",
            "value": "0x0000000000000000000000000000000000000000",
            "hashed": false,
            "type": "address"
          },
          {
            "name": "to",
            "value": "0xF9450D254A66ab06b30Cfa9c6e7AE1B7598c7172",
            "hashed": false,
            "type": "address"
          },
          {
            "name": "value",
            "value": "123.456",
            "hashed": false,
            "type": "uint256"
          }
        ],
        "rawFields": "{\"address\":\"0x9dee62d32898b37f2bdf7e7cb1fa16a45d31d67a\",\"topics\":[\"0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef\",\"0x0000000000000000000000000000000000000000000000000000000000000000\",\"0x000000000000000000000000f9450d254a66ab06b30cfa9c6e7ae1b7598c7172\"],\"data\":\"0x000000000000000000000000000000000000000000000000000000000001e240\",\"blockNumber\":\"0xa\",\"transactionHash\":\"0xe6136095471608942dda7f20b81b8a92c3bbb733ff4e6cb2960e6b457e1e14b2\",\"transactionIndex\":\"0x0\",\"blockHash\":\"0xa63e7d8463ca0d1285fc0585529edff5527821ec5d30d679d7a9496fe67563ec\",\"logIndex\":\"0x1\",\"removed\":false}",
        "contract": {
          "address": "0x9deE62D32898B37F2BDf7e7cB1FA16a45D31D67a",
          "addressLabel": "autotoken",
          "name": "MltiToken",
          "label": "mltitoken"
        },
        "indexInLog": 1
      },
      "transaction": {
        "from": "0xF9450D254A66ab06b30Cfa9c6e7AE1B7598c7172",
        "txData": "0xa0712d68000000000000000000000000000000000000000000000000000000000001e240",
        "txHash": "0xe6136095471608942dda7f20b81b8a92c3bbb733ff4e6cb2960e6b457e1e14b2",
        "txIndexInBlock": 0,
        "blockHash": "0xa63e7d8463ca0d1285fc0585529edff5527821ec5d30d679d7a9496fe67563ec",
        "blockNumber": 10,
        "contract": {
          "address": "0x9deE62D32898B37F2BDf7e7cB1FA16a45D31D67a",
          "addressLabel": "autotoken",
          "name": "MltiToken",
          "label": "mltitoken"
        },
        "method": {
          "name": "mint",
          "signature": "mint(uint256)",
          "inputs": [
            {
              "name": "_amount",
              "value": "123.456",
              "type": "uint256"
            }
          ]
        }
      }
    }
  }
]