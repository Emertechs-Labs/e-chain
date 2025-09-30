Refer https://www.npmjs.com/package/@curvegrid/multibaas-sdk

@curvegrid/multibaas-sdk@1.0.12
This generator creates TypeScript/JavaScript client that utilizes axios. The generated Node module can be used in the following environments:

Environment

Node.js
Webpack
Browserify
Language level

ES5 - you must have a Promises/A+ library installed
ES6
Module system

CommonJS
ES6 module system
It can be used in both TypeScript and JavaScript. In TypeScript, the definition will be automatically resolved via package.json. (Reference)

Building
To build and compile the typescript sources to javascript use:

npm install
npm run build
Publishing
First build the package then run npm publish

Consuming
navigate to the folder of your consuming project and run one of the following commands.

published:

npm install @curvegrid/multibaas-sdk@1.0.12 --save
unPublished (not recommended):

npm install PATH_TO_GENERATED_PACKAGE --save
Documentation for API Endpoints
All URIs are relative to https://your_deployment.multibaas.com/api/v0

Class	Method	HTTP request	Description
AddressesApi	deleteAddress	DELETE /chains/{chain}/addresses/{address-or-alias}	Delete address
AddressesApi	getAddress	GET /chains/{chain}/addresses/{address-or-alias}	Get address
AddressesApi	listAddresses	GET /chains/{chain}/addresses	List addresses
AddressesApi	setAddress	POST /chains/{chain}/addresses	Create or update address
AdminApi	acceptInvite	POST /invites/{inviteID}	Accept invite
AdminApi	addCorsOrigin	POST /cors	Add CORS origin
AdminApi	addGroupApiKey	PUT /groups/{groupID}/api_keys/{apiKeyID}	Add API key to group
AdminApi	addGroupRole	PUT /groups/{groupID}/roles/{roleShortName}	Add role to group
AdminApi	addGroupUser	PUT /groups/{groupID}/users/{userID}	Add user to group
AdminApi	checkInvite	GET /invites/{inviteID}	Check invite
AdminApi	createApiKey	POST /api_keys	Create API key
AdminApi	deleteApiKey	DELETE /api_keys/{apiKeyID}	Delete API key
AdminApi	deleteInvite	DELETE /invites/{email}/delete	Delete invite
AdminApi	deleteUser	DELETE /users/{userID}	Delete user
AdminApi	getApiKey	GET /api_keys/{apiKeyID}	Get API Key
AdminApi	getPlan	GET /plan	Get plan
AdminApi	inviteUser	POST /invites	Invite user
AdminApi	listApiKeys	GET /api_keys	List API keys
AdminApi	listAuditLogs	GET /systemactivities	List audit logs
AdminApi	listCorsOrigins	GET /cors	List CORS origins
AdminApi	listGroups	GET /groups	List groups
AdminApi	listInvites	GET /invites	List invites
AdminApi	listUserSigners	GET /users/{userID}/signers	List user signers
AdminApi	listUsers	GET /users	List users
AdminApi	removeCorsOrigin	DELETE /cors/{originID}	Remove CORS Origin
AdminApi	removeGroupApiKey	DELETE /groups/{groupID}/api_keys/{apiKeyID}	Remove API key from group
AdminApi	removeGroupRole	DELETE /groups/{groupID}/roles/{roleShortName}	Remove role from group
AdminApi	removeGroupUser	DELETE /groups/{groupID}/users/{userID}	Remove user from group
AdminApi	removeUserSignerCloudWallet	DELETE /users/{userID}/cloudwallets/{wallet_address}	Remove user cloud wallet signer
AdminApi	removeUserSignerSafeAccount	DELETE /users/{userID}/safeaccounts/{wallet_address}	Remove user safe account signer
AdminApi	removeUserSignerWeb3Wallet	DELETE /users/{userID}/web3wallets/{wallet_address}	Remove user web3 wallet signer
AdminApi	setUserSignerCloudWallet	PUT /users/{userID}/cloudwallets/{wallet_address}	Add or update user cloud wallet signer
AdminApi	setUserSignerSafeAccount	PUT /users/{userID}/safeaccounts/{wallet_address}	Add or update user safe account signer
AdminApi	setUserSignerWeb3Wallet	PUT /users/{userID}/web3wallets/{wallet_address}	Add or update user web3 wallet signer
AdminApi	updateApiKey	PUT /api_keys/{apiKeyID}	Update API key
ChainsApi	getBlock	GET /chains/{chain}/blocks/{block}	Get a block
ChainsApi	getChainStatus	GET /chains/{chain}/status	Get chain status
ChainsApi	getTransaction	GET /chains/{chain}/transactions/{hash}	Get transaction
ChainsApi	getTransactionReceipt	GET /chains/{chain}/transactions/receipt/{hash}	Get transaction receipt
ChainsApi	submitSignedTransaction	POST /chains/{chain}/transactions/submit	Submit signed transaction
ChainsApi	transferEth	POST /chains/{chain}/transfers	Transfer ETH
ContractsApi	callContractFunction	POST /chains/{chain}/addresses/{address-or-alias}/contracts/{contract}/methods/{method}	Call a contract function
ContractsApi	createContract	POST /contracts/{contract}	Create a contract
ContractsApi	createContracts	POST /contracts	Create multiple contracts
ContractsApi	deleteContract	DELETE /contracts/{contract}	Delete a contract
ContractsApi	deleteContractVersion	DELETE /contracts/{contract}/{version}	Delete a contract version
ContractsApi	deployContract	POST /contracts/{contract}/deploy	Deploy a contract
ContractsApi	deployContractVersion	POST /contracts/{contract}/{version}/deploy	Deploy a contract version
ContractsApi	getContract	GET /contracts/{contract}	Get a contract
ContractsApi	getContractVersion	GET /contracts/{contract}/{version}	Get a contract version
ContractsApi	getContractVersions	GET /contracts/{contract}/all	Get all contract versions
ContractsApi	getEventMonitorStatus	GET /chains/{chain}/addresses/{address-or-alias}/contracts/{contract}/status	Get event monitor status
ContractsApi	getEventTypeConversions	GET /contracts/{contract}/{version}/events/{event}	Get event type conversions
ContractsApi	getFunctionTypeConversions	GET /contracts/{contract}/{version}/methods/{method}	Get function type conversions
ContractsApi	linkAddressContract	POST /chains/{chain}/addresses/{address-or-alias}/contracts	Link address and contract
ContractsApi	listContractVersions	GET /contracts/{contract}/versions	List all contract versions
ContractsApi	listContracts	GET /contracts	List contracts
ContractsApi	setEventTypeConversions	POST /contracts/{contract}/{version}/events/{event}	Set event type conversions
ContractsApi	setFunctionTypeConversions	POST /contracts/{contract}/{version}/methods/{method}	Set function type conversions
ContractsApi	unlinkAddressContract	DELETE /chains/{chain}/addresses/{address-or-alias}/contracts/{contract}	Unlink address and contract
EventQueriesApi	countEventQueryRecords	GET /queries/{event_query}/count	Count event query records
EventQueriesApi	deleteEventQuery	DELETE /queries/{event_query}	Delete event query
EventQueriesApi	executeArbitraryEventQuery	POST /queries	Execute arbitrary event query
EventQueriesApi	executeEventQuery	GET /queries/{event_query}/results	Execute event query
EventQueriesApi	getEventQuery	GET /queries/{event_query}	Get event query
EventQueriesApi	listEventQueries	GET /queries	List event queries
EventQueriesApi	setEventQuery	PUT /queries/{event_query}	Create or update event query
EventsApi	getEventCount	GET /events/count	Get event count
EventsApi	listEvents	GET /events	List events
HsmApi	addHsmConfig	POST /hsm/config	Add HSM config
HsmApi	addHsmKey	POST /hsm/key	Add HSM key
HsmApi	createHsmKey	POST /hsm/key/new	Create HSM key
HsmApi	listHsm	GET /hsm	List HSM configs and wallets
HsmApi	listHsmWallets	GET /hsm/wallets	List HSM wallets
HsmApi	removeHsmConfig	DELETE /hsm/config/{client_id}	Remove HSM config
HsmApi	removeHsmKey	DELETE /hsm/key/{wallet_address}	Remove HSM key
HsmApi	setLocalNonce	POST /chains/{chain}/hsm/nonce/{wallet_address}	Set local nonce
HsmApi	signAndSubmitTransaction	POST /chains/{chain}/hsm/submit	Sign and submit transaction
HsmApi	signData	POST /chains/{chain}/hsm/sign	Sign data
TxmApi	cancelTransaction	POST /chains/{chain}/txm/{wallet_address}/nonce/{nonce}/cancel	Cancel transaction
TxmApi	countWalletTransactions	GET /chains/{chain}/txm/{wallet_address}/count	Count all transactions for a wallet
TxmApi	listWalletTransactions	GET /chains/{chain}/txm/{wallet_address}	List transactions for a wallet
TxmApi	speedUpTransaction	POST /chains/{chain}/txm/{wallet_address}/nonce/{nonce}/speed_up	Speed up transaction
WebhooksApi	countWebhookEvents	GET /webhooks/{webhookID}/events/count	Count webhook events
WebhooksApi	countWebhooks	GET /webhooks/count	Count webhooks
WebhooksApi	createWebhook	POST /webhooks	Create webhook
WebhooksApi	deleteWebhook	DELETE /webhooks/{webhookID}	Delete webhook
WebhooksApi	getWebhook	GET /webhooks/{webhookID}	Get webhook
WebhooksApi	listWebhookEvents	GET /webhooks/{webhookID}/events	List webhook events
WebhooksApi	listWebhooks	GET /webhooks	List webhooks
WebhooksApi	updateWebhook	PUT /webhooks/{webhookID}	Update webhook
Documentation For Models
APIKey
APIKeyWithSecret
AcceptInvite200Response
AcceptInviteRequest
AccessTuple
AddKey
Address
AddressAlias
AuditLog
AuthorizationExtraInfo
AzureAccount
AzureHardwareWallet
AzureWallet
BaseAPIKey
BaseAzureAccount
BaseContract
BaseResponse
BaseUser
BaseWebhookEndpoint
Block
CORSOrigin
CallContractFunction200Response
CallContractFunction200ResponseAllOfResult
ChainName
ChainStatus
CloudWalletTXToSign
CloudWalletTXToSignTx
Contract
ContractABI
ContractABIError
ContractABIErrorArgument
ContractABIEvent
ContractABIEventArgument
ContractABIMethod
ContractABIMethod1
ContractABIMethodArgument
ContractABIType
ContractABITypeConversion
ContractEventOptions
ContractInformation
ContractInstance
ContractLookup
ContractMetadata
ContractMethodInformation
ContractMethodOptions
ContractOverview
ContractParameter
CountEventQueryRecords200Response
CountWalletTransactions200Response
CountWebhookEvents200Response
CountWebhooks200Response
CreateApiKey200Response
CreateApiKeyRequest
CreateHsmKey200Response
CreateKey
CreateWebhook200Response
DeployContract200Response
DeployContractTransaction
EIP712Domain
EIP712DomainChainId
EIP712TypeEntry
EIP712TypedData
EIP712Types
Event
EventField
EventInformation
EventMonitorStatus
EventQuery
EventQueryEvent
EventQueryField
EventQueryFilter
EventQueryResults
EventTypeConversionOptions
ExecuteArbitraryEventQuery200Response
FieldType
GasParams
GetApiKey200Response
GetBlock200Response
GetChainStatus200Response
GetContract200Response
GetContractVersions200Response
GetEventCount200Response
GetEventMonitorStatus200Response
GetEventQuery200Response
GetEventTypeConversions200Response
GetFunctionTypeConversions200Response
GetPlan200Response
GetTransaction200Response
GetTransactionReceipt200Response
Group
HSMData
HSMSignRequest
HSMSignRequestPersonalSign
HSMSignRequestPersonalSignChainId
HSMSignRequestTypedData
HSMSignResponse
Invite
InviteRequest
LinkAddressContractRequest
ListAddresses200Response
ListApiKeys200Response
ListAuditLogs200Response
ListContractVersions200Response
ListContractVersions200ResponseAllOfResult
ListContracts200Response
ListCorsOrigins200Response
ListEventQueries200Response
ListEvents200Response
ListGroups200Response
ListHsm200Response
ListHsmWallets200Response
ListInvites200Response
ListUserSigners200Response
ListUsers200Response
ListWalletTransactions200Response
ListWebhookEvents200Response
ListWebhooks200Response
Log
MethodArg
MethodCallResponse
MethodTypeConversionOptions
ModelError
Plan
PlanFeature
PlanLimit
PostMethodArgs
PostMethodResponse
Role
SavedEventQuery
SetAddress201Response
SetCodeAuthorization
SetNonceRequest
SignData200Response
SignedTransactionResponse
SignedTransactionSubmission
SignerLabel
SignerWallet
StandaloneWallet
SubmitSignedTransaction200Response
Transaction
TransactionData
TransactionInformation
TransactionReceipt
TransactionReceiptData
TransactionStatus
TransactionToSign
TransactionToSignResponse
TransactionToSignTx
TransferEth200Response
TypeConversionOptions
User
WalletTransaction
WebhookEndpoint
WebhookEvent
WebhookEventsType

Documentation For Authorization
Authentication schemes defined for the API:

bearer
Type: Bearer authentication (JWT)

cookie
Type: API key
API key parameter name: token
Location:
Readme
Keywords
curvegridmultibaas@curvegrid/multibaas-sdk
Package Sidebar
Install
npm i @curvegrid/multibaas-sdk


Repository
github.com/curvegrid/multibaas-sdk-typescript

Homepage
github.com/curvegrid/multibaas-sdk-typescript#readme

Weekly Downloads
73

Version
1.0.12

License
MIT

Unpacked Size
1.74 MB

Total Files
187

Issues
0

Pull Requests
0

Last publish
a month ago

Collaborators
dahu
npmwilliam
shoenseiwaso
n0thingness
daenamkim
cgtools
Try on RunKit
