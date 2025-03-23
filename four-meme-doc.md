# CHANGES - 18/02/2025

## TokenManager2(V2)

- added a method `sellToken(origin, token, amount, minFunds, feeRate, feeRecipient)` to support setting fee recipient
- added a method `sellToken(origin, token, from, amount, minFunds, feeRate, feeRecipient)` to support routers call


# CHANGES - 01/02/2025

## TokenManagerHelper3(V3)
- change contract address to below:
  
  - BSC: 0xF251F83e40a78868FcfA3FA4599Dad6494E46034

  - Arbitrum One: 0x02287dc3CcA964a025DAaB1111135A46C10D3A57

  - Base: 0x1172FABbAc4Fe05f5a5Cebd8EBBC593A76c42399

- change the method `tryBuy` to support new features 
- TokenManagerHelper V1/V2 should be upgraded to V3


# CHANGES - 01/10/2024

## TokenManagerHelper2(V2)

- change contract address to `0x79c7909097a2a5cedb8da900e3192cee671521a6`
- bug fixes for the method `tryBuy`

# CHANGES - 19/09/2024

## TokenManager(V1) & TokenManager2(V2)

- These smart contracts are designed for creating new tokens and executing trades.
- The old TokenManager (referred to as V1) still functions for trading tokens that have already been created but cannot create new tokens; It is only used to support the buying and selling of tokens created before the TokenManager2 (referred to as V2) deployment.
- If full support four.meme is needed, both TokenManager V1 and V2 should be supported.
- If you only wish to support tokens created after September 5, 2024, then only V2 TokenManager needs to be supported.
- The method for simultaneously supporting both V1 and V2 TokenManagers is as follows:
    - First, use the TokenManagerHelper method getTokenInfo to get the token information.
    - Check information if the token was created by V1 that the tradings should be processed through the interfaces of old V1 TokenManager. Otherwise, use the V2 version.
    - If pre-calculations of trading are needed, call helper methods.

## TokenManagerHelper3 (V3)

- This smart contract is a wrapper of the TokenManagers. It is designed for getting token information and performing pre-calculations easily.
- The old TokenManagerHelper (referred to as V1/V2) still works but we have provided a new TokenManagerHelper3 (referred to as V3) contract that unifies the information query interfaces for both V1 TokenManager and V3 TokenManager.
- We recommend users who have previously used V1/V2 helper to migrate to V3 helper. it supports tokens created by both TokenManager V1 and V2.
  

# Protocol Interfaces
# TokenManager (V1)

This smart contract is mainly used to create new tokens and execute trades. Support tokens created before September 5, 2024.

**Address on BSC**

`0xEC4549caDcE5DA21Df6E6422d448034B5233bFbC`

**ABI File**

`TokenManager.lite.abi`

## Methods

- **`purchaseTokenAMAP(address token, uint256 funds, uint256 minAmount)`**
    
    If the user wants to buy a specific amount of BNB worth of tokens.
    
    - `token`: Token address
    - `funds`: Amount of BNB
    - `minAmount`: Minimum amount of tokens to be purchased if the price changes
- **`purchaseToken(address token, uint256 amount, uint256 maxFunds)`**
    
    If the user wants to buy a specific amount of tokens.
    
    - `token`: Token address
    - `amount`: Amount of tokens
    - `maxFunds`: Maximum amount of BNB to be spent if the price changes
- **`saleToken(address token, uint256 amount)`**
    
    If the user wants to sell tokens.
    
    - `token`: Token address
    - `amount`: Amount of tokens

## Events

- **`TokenCreate(address creator, address token, uint256 requestId, string name, string symbol, uint256 totalSupply, uint256 launchTime)`**
    
    Emitted when a new token is created.
    
    - `creator`: Address of the token creator
    - `token`: Address of the created token
    - `requestId`: Unique identifier for the token creation request
    - `name`: Name of the token
    - `symbol`: Symbol of the token
    - `totalSupply`: Total supply of the token
    - `launchTime`: Launch time of the token
- **`TokenPurchase(address token, address account, uint256 tokenAmount, uint256 etherAmount)`**
    
    Emitted when tokens are purchased.
    
    - `token`: Address of the token purchased
    - `account`: Address of the buyer
    - `tokenAmount`: Amount of tokens purchased
    - `etherAmount`: Amount of BNB spent on the purchase
- **`TokenSale(address token, address account, uint256 tokenAmount, uint256 etherAmount)`**
    
    Emitted when tokens are sold.
    
    - `token`: Address of the token sold
    - `account`: Address of the seller
    - `tokenAmount`: Amount of tokens sold
    - `etherAmount`: Amount of BNB received from the sale

# TokenManager2 (V2)

TokenManager2 is V2 of TokenManager, which is a significant upgrade that now supports the features of purchasing tokens using both BNB and BEP20. Support tokens created after September 5, 2024.

**Address on BSC**

`0x5c952063c7fc8610FFDB798152D69F0B9550762b`

**ABI File**

`TokenManager2.lite.abi`

## Methods

- **`buyTokenAMAP(address token, uint256 funds, uint256 minAmount)`**
    
    If the user wants to buy a specific amount of BNB worth of tokens for msg.sender.
    
    - `token`: Token address
    - `funds`: Amount of BNB
    - `minAmount`: Minimum amount of tokens to be purchased if the price changes
- **`buyTokenAMAP(address token, address to, uint256 funds, uint256 minAmount)`**
    
    If the user wants to buy a specific amount of BNB worth of tokens for another recipient.
    
    - `token`: Token address
    - `to`: Specific recipient of the token
    - `funds`: Amount of BNB
    - `minAmount`: Minimum amount of tokens to be purchased if the price changes
- **`buyToken(address token, uint256 amount, uint256 maxFunds)`**
    
    If the user wants to buy a specific amount of tokens for msg.sender.
    
    - `token`: Token address
    - `amount`: Amount of tokens
    - `maxFunds`: Maximum amount of BNB that could be spent if the price changes
- **`buyToken(address token, address to, uint256 amount, uint256 maxFunds)`**
    
    If the user wants to buy a specific amount of tokens for another recipient.
    
    - `token`: Token address
    - `to`: Recipient of the token
    - `amount`: Amount of tokens
    - `maxFunds`: Maximum amount of BNB that could be spent if the price changes
- **`sellToken(address token, uint256 amount)`**
    
    If the user wants to sell tokens.
    
    - `token`: Token address
    - `amount`: Amount of tokens


- **`sellToken(uint256 origin, address token, uint256 amount, uint256 minFunds, uint256 feeRate, address feeRecipient)`**

    If the user wants to sell tokens with a third-party fee recipient.
  
    - `origin`: The platform from which the request is sent. Pass 0 if not applicable.
    - `token`: The address of the token to be sold.
    - `amount`: The amount of tokens to be sold.
    - `minFunds`: The minimum amount of funds to be received after the sale.
    - `feeRate`: The router’s fee rate. 100 means 1%, and 10 means 0.1%. (MAX 5%)
    - `feeRecipient`: The address that will receive the fee.

- **`sellToken(uint256 origin, address token, address from, uint256 amount, uint256 minFunds, uint256 feeRate, address feeRecipient)`**

    If the user wants to sell tokens through a third-party router, the original sender of the transaction must be the token owner.
  
    - `origin`: The platform from which the request is sent. Pass 0 if not applicable.
    - `token`: The address of the token to be sold.
    - `from`: The address of the token owner(tx.orgin == from).
    - `amount`: The amount of tokens to be sold.
    - `minFunds`: The minimum amount of funds to be received after the sale.
    - `feeRate`: The router’s fee rate. 100 means 1%, and 10 means 0.1%. (MAX 5%)
    - `feeRecipient`: The address that will receive the fee.

- Before calling `sellToken`, the token owner has to approve first `ERC20.approve(tokenManager, amount)`.

## Events

- **`TokenCreate(address creator, address token, uint256 requestId, string name, string symbol, uint256 totalSupply, uint256 launchTime, uint256 launchFee)`**
    
    Emitted when a new token is created.
    
    - `creator`: Address of the creator of the token
    - `token`: Address of the newly created token
    - `requestId`: Unique request ID for the creation
    - `name`: Name of the token
    - `symbol`: Symbol of the token
    - `totalSupply`: Total supply of the token
    - `launchTime`: Timestamp when the token was launched
    - `launchFee`: Fee paid for launching the token
- **`TokenPurchase(address token, address account, uint256 price, uint256 amount, uint256 cost, uint256 fee, uint256 offers, uint256 funds)`**
    
    Emitted when a token is purchased.
    
    - `token`: Address of the token being purchased
    - `account`: Address of the account making the purchase
    - `price`: Price per token at the time of purchase
    - `amount`: Amount of tokens purchased
    - `cost`: Total cost for the purchase
    - `fee`: Fee paid
    - `offers`: Number of offers available at the time of purchase
    - `funds`: Total funds used for the purchase
- **`TokenSale(address token, address account, uint256 price, uint256 amount, uint256 cost, uint256 fee, uint256 offers, uint256 funds)`**
    
    Emitted when a token is sold.
    
    - `token`: Address of the token being sold
    - `account`: Address of the account making the sale
    - `price`: Price per token at the time of sale
    - `amount`: Amount of tokens sold
    - `cost`: Total cost for the sale
    - `fee`: Fee paid
    - `offers`: Number of offers available at the time of sale
    - `funds`: Total funds received from the sale
- **`TradeStop(address token)`**
    
    Emitted when trading for a specific token is stopped.
    
    - `token`: Address of the token for which trading is stopped
- **`LiquidityAdded(address base, uint256 offers, address quote, uint256 funds)`**
    
    Emitted when liquidity is added to the token.
    
    - `base`: Address of the base token
    - `offers`: Number of offers added
    - `quote`: Address of the quote token which is the token traded by. If quote returns address 0, it means the token is traded by BNB. otherwise traded by BEP20
    - `funds`: Total funds added for liquidity

# TokenManagerHelper3 (V3)

This smart contract is a wrapper of the TokenManager. It is designed for getting token information and performing pre-calculations easily. Support tokens created by both TokenManager V1 and V2.

**Address**

- BSC: 0xF251F83e40a78868FcfA3FA4599Dad6494E46034

- Arbitrum One: 0x02287dc3CcA964a025DAaB1111135A46C10D3A57

- Base: 0x1172FABbAc4Fe05f5a5Cebd8EBBC593A76c42399

**ABI File**

`TokenManagerHelper3.abi`

## Methods

- **`getTokenInfo(address token) returns (uint256 version, address tokenManager, address quote, uint256 lastPrice, uint256 tradingFeeRate, uint256 minTradingFee, uint256 launchTime, uint256 offers, uint256 maxOffers, uint256 funds, uint256 maxFunds, bool liquidityAdded)`**
    
    Get information about the token.
    
    - `token`: The address of your token
    - Returns:
        - `version`: The TokenManager version. If version returns 1, you should call V1 TokenManager methods for trading. If version returns 2, call V2
        - `tokenManager`: The address of the token manager which manages your token. We recommend using this address to call the TokenManager-related interfaces and parameters, replacing the hardcoded TokenManager addresses
        - `quote`: The address of the quote token of your token. If quote returns address 0, it means the token is traded by BNB. otherwise traded by BEP20
        - `lastPrice`: The last price of your token
        - `tradingFeeRate`: The trading fee rate of your token. The actual usage of the fee rate should be the return value divided by 10,000
        - `minTradingFee`: The amount of minimum trading fee
        - `launchTime`: Launch time of the token
        - `offers`: Amount of tokens that are not sold
        - `maxOffers`: Maximum amount of tokens that could be sold before creating Pancake pair
        - `funds`: Amount of paid BNB or BEP20 received
        - `maxFunds`: Maximum amount of paid BNB or BEP20 that could be received
        - `liquidityAdded`: True if the Pancake pair has been created
- **`tryBuy(address token, uint256 amount, uint256 funds) public view returns (address tokenManager, address quote, uint256 estimatedAmount, uint256 estimatedCost, uint256 estimatedFee, uint256 amountMsgValue, uint256 amountApproval, uint256 amountFunds)`**  
  Attempt to buy a token and get estimated results.

  - `token`: The address of the token to purchase  
  - `amount`: The amount of the token the user wants to purchase  
  - `funds`: The amount of money the user wants to spend (in the quote currency)

  **Returns**:
    - `tokenManager`: The address of the TokenManager associated with the token  
    - `quote`: The address of the quote currency for the token, where `address(0)` represents ETH or BNB  
    - `estimatedAmount`: The estimated amount of tokens that can be bought  
    - `estimatedCost`: The estimated cost in the quote currency  
    - `estimatedFee`: The estimated fee for the transaction  
    - `amountMsgValue`: The value to be set in `msg.value` when calling `TokenManager.buyToken()` or `TokenManager.buyTokenAMAP()`  
    - `amountApproval`: The amount of tokens that need to be pre-approved for `TokenManager.buyToken()` or `TokenManager.buyTokenAMAP()`  
    - `amountFunds`: The value used for the `funds` parameter when calling `TokenManager.buyTokenAMAP()`

  **Example**:

  - If the user wants to buy 10,000 tokens:
    - Call: `tryBuy(token, 10000*1e18, 0)`

  - If the user wants to spend 10 BNB to purchase tokens:
    - Call: `tryBuy(token, 0, 10*1e18)`
  

- **`trySell(address token, uint256 amount) returns (address tokenManager, address quote, uint256 funds, uint256 fee)`**

    Just pre-calculate the result if the user sells a specified amount of tokens if needed.
    
    - `token`: The address of token
    - `amount`: The amount of token that the user wants to sell
    - Returns:
        - `tokenManager`: The address of the token manager which manages your token
        - `quote`: The address of the quote token of your token
        - `funds`: The amount of quote token users will receive for selling a token
        - `fee`: The amount of quote token users will pay for trading fee
  
- **`calcInitialPrice(uint256 maxRaising, uint256 totalSupply, uint256 offers, uint256 reserves) returns (uint256 priceWei)`**

    This function calculates the initial price of each token based on the specified parameters such as the amount raised, total supply, tokens available for sale, and reserved tokens.


    - `maxRaising`: The maximum amount of BNB to be raised. It represents the maximum BNB amount the project aims to raise through the token issuance.
    - `totalSupply`: The total token supply. It represents the maximum amount of tokens the issuer plans to release.
    - `offers`: The number of tokens available for sale in the initial offering. It represents the amount of tokens available for public sale in the initial stage.
    - `reserves`: The reserved token amount. It represents the number of tokens retained by the issuer, typically for the team or future use.
    - Returns:
        - `priceWei`: The initial token price in Wei.
    
    