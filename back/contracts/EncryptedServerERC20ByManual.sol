// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title ServerEncryptedERC20
 * @dev Server-assisted encrypted token balances
 *
 */
contract ServerEncryptedERC20Manual is Ownable {
    using SafeERC20 for IERC20;
    IERC20 public immutable underlyingToken;
    address public immutable serverManager;
    uint256 public encryptedSupply;

    mapping(bytes32 => bool) public depositCompleted;

    // Storage for encrypted data
    struct EncryptedBalance {
        bytes encryptedAmount;              // Amount encrypted with symmetric key
        bytes encryptedSymmetricKeyUser;    // Symmetric key encrypted for user
        bytes encryptedSymmetricKeyServer;  // Symmetric key encrypted for server
        bool exists;
    }

    mapping(bytes32 => EncryptedBalance) public userEncryptedBalances; // Changed from address to bytes32 (index)

    // Mapping from user address to their encrypted index (encrypted for server)
    mapping(address => bytes) public userAddressToEncryptedIndex;

    event DepositRequested(
        bytes32 indexed requestId,
        bytes packedData,  // abi.encodePacked(user, amount, timestamp, blockNumber)
        bytes encryptedIndex  // Encrypted user index (only server can decrypt)
    );

    event BalanceStored(
        bytes32 indexed requestId,
        address indexed user,
        bytes encryptedAmount,
        bytes encryptedSymmetricKeyUser,
        bytes encryptedSymmetricKeyServer
    );

    event UserAuthenticated(
        address indexed user,
        bytes encryptedIndex
    );

    modifier onlyServerManager() {
        require(msg.sender == serverManager, "Only server manager can call this");
        _;
    }

    constructor(address _underlyingToken, address _serverManager) Ownable(msg.sender) {
        require(_underlyingToken != address(0), "Invalid token address");
        require(_serverManager != address(0), "Invalid server address");
        underlyingToken = IERC20(_underlyingToken);
        serverManager = _serverManager;
    }

    /**
     * @dev User authenticates themselves by storing their encrypted index
     * @param _encryptedIndex The user's index encrypted for the server manager
     * This allows the server to look up the user's index by their address
     */
    function authenticateUser(bytes calldata _encryptedIndex) external {
        require(_encryptedIndex.length > 0, "Invalid encrypted index");

        // Store the encrypted index for this user's address
        userAddressToEncryptedIndex[msg.sender] = _encryptedIndex;

        emit UserAuthenticated(msg.sender, _encryptedIndex);
    }

    /**
     * @dev Server can get a user's encrypted index by their address
     * @param _userAddress The address of the user
     * @return encryptedIndex The encrypted index for that user
     */
    function getUserIndexByAddress(address _userAddress) external view returns (bytes memory encryptedIndex) {
        require(userAddressToEncryptedIndex[_userAddress].length > 0, "User not authenticated");
        return userAddressToEncryptedIndex[_userAddress];
    }

    function requestDeposit(uint256 _amount, bytes calldata _encryptedIndex) external returns (bytes32 requestId) {
        require(_amount > 0, "Amount must be > 0");
        require(_encryptedIndex.length > 0, "Invalid encrypted index");

        // If user hasn't authenticated yet, store their encrypted index
        if (userAddressToEncryptedIndex[msg.sender].length == 0) {
            userAddressToEncryptedIndex[msg.sender] = _encryptedIndex;
            emit UserAuthenticated(msg.sender, _encryptedIndex);
        }

        // Pack the data
        bytes memory packedData = abi.encodePacked(
            msg.sender,
            _amount,
            block.timestamp,
            block.number
        );

        // Generate unique request ID from packed data
        requestId = keccak256(packedData);

        // Transfer tokens
        underlyingToken.safeTransferFrom(msg.sender, address(this), _amount);
        encryptedSupply += _amount;

        // Emit event with packed data and encrypted index
        emit DepositRequested(requestId, packedData, _encryptedIndex);

        return requestId;
    }

    function storeDeposit(
        bytes32 _requestId,
        bytes32 _userIndex,
        bytes calldata _encryptedAmount,
        bytes calldata _encryptedSymmetricKeyUser,
        bytes calldata _encryptedSymmetricKeyServer
    ) external onlyServerManager {
        require(!depositCompleted[_requestId], "Already completed");
        require(_userIndex != bytes32(0), "Invalid user index");
        require(_encryptedAmount.length > 0, "Invalid encrypted amount");
        require(_encryptedSymmetricKeyUser.length > 0, "Invalid encrypted key for user");
        require(_encryptedSymmetricKeyServer.length > 0, "Invalid encrypted key for server");

        // Store encrypted balance using user index
        userEncryptedBalances[_userIndex] = EncryptedBalance({
            encryptedAmount: _encryptedAmount,
            encryptedSymmetricKeyUser: _encryptedSymmetricKeyUser,
            encryptedSymmetricKeyServer: _encryptedSymmetricKeyServer,
            exists: true
        });

        depositCompleted[_requestId] = true;

        emit BalanceStored(
            _requestId,
            address(0),  // No longer emit actual user address for privacy
            _encryptedAmount,
            _encryptedSymmetricKeyUser,
            _encryptedSymmetricKeyServer
        );
    }

    // View function to get user's encrypted balance by user index
    function getEncryptedBalance(bytes32 _userIndex) external view returns (
        bytes memory encryptedAmount,
        bytes memory encryptedSymmetricKeyUser,
        bytes memory encryptedSymmetricKeyServer,
        bool exists
    ) {
        EncryptedBalance memory balance = userEncryptedBalances[_userIndex];
        return (
            balance.encryptedAmount,
            balance.encryptedSymmetricKeyUser,
            balance.encryptedSymmetricKeyServer,
            balance.exists
        );
    }
}
