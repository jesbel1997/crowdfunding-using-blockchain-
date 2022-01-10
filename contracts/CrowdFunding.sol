pragma solidity >=0.4.22 <0.7.0;


contract CrowdFunding {
    //Investor data
    struct investor {
        bytes name;
        bytes32 password;
        uint8 accStatus;
        uint32 investedCount;
        mapping(uint32 => uint256) investedCampaigns;
        uint32 requestCount;
        mapping(uint32 => uint256) requests;
    }
    mapping(address => investor) public investors;

    //Campaign data
    struct campaign {
        bytes title;
        bytes description;
        bytes teamMembers;
        uint256 minContribution;
        uint256 balence;
        bytes32 password;
        uint8 accStatus;
        uint32 investedCount;
        mapping(uint32 => uint256) investedCampaigns;
        uint32 requestCount;
        mapping(uint32 => uint256) requests;
    }
    mapping(uint256 => campaign) public campaigns;
    mapping(address => uint256) public campaignsAddrToIndex;
    uint256 public campaignCount = 0;

    //Investment data
    struct investedCampaign {
        uint256 campID;
        address investedBy;
        uint256 amount;
        uint256 balance;
    }
    mapping(uint256 => investedCampaign) public investedCampaigns;
    uint256 public investmentCount = 0;

    //Request data
    struct request {
        uint256 campID;
        bytes campTitle;
        address payable recipient;
        address payer;
        bytes purpose;
        uint256 amount;
        uint256 status;
    }
    mapping(uint256 => request) public requests;
    uint256 public requestCount = 0;

    //Registration
    function registerInvestor(bytes memory name, bytes memory password) public {
        bytes32 passHash = keccak256(password);
        investors[msg.sender].name = name;
        investors[msg.sender].password = passHash;
        investors[msg.sender].accStatus = 1;
        investors[msg.sender].investedCount = 0;
        investors[msg.sender].requestCount = 0;
    }

    function registerCampaign(
        bytes memory title,
        bytes memory description,
        bytes memory teamMembers,
        uint256 minContribution,
        bytes memory password
    ) public {
        campaignCount = campaignCount + 1;
        bytes32 passHash = keccak256(password);
        campaigns[campaignCount].title = title;
        campaigns[campaignCount].description = description;
        campaigns[campaignCount].teamMembers = teamMembers;
        campaigns[campaignCount].minContribution = minContribution;
        campaigns[campaignCount].password = passHash;
        campaigns[campaignCount].accStatus = 1;
        campaigns[campaignCount].investedCount = 0;
        campaigns[campaignCount].requestCount = 0;
        campaigns[campaignCount].balence = 0;
        campaignsAddrToIndex[msg.sender] = campaignCount;
    }

    //Login
    function loginInvestor(bytes memory password) public view returns (bool) {
        bytes32 passHash = keccak256(password);
        if (investors[msg.sender].password == passHash) {
            return true;
        } else {
            return false;
        }
    }

    function loginCampaign(bytes memory password)
        public
        view
        returns (bool, uint256)
    {
        bytes32 passHash = keccak256(password);
        uint256 index = campaignsAddrToIndex[msg.sender];
        if (campaigns[index].password == passHash) {
            return (true, index);
        } else {
            return (false, 0);
        }
    }

    //Investing
    function invest(uint256 campID) public payable {
        investmentCount = investmentCount + 1;
        investedCampaigns[investmentCount].campID = campID;
        investedCampaigns[investmentCount].investedBy = msg.sender;
        investedCampaigns[investmentCount].amount = msg.value;
        investedCampaigns[investmentCount].balance = msg.value;
        campaigns[campID].investedCount = campaigns[campID].investedCount + 1;
        campaigns[campID].balence = campaigns[campID].balence + msg.value;
        campaigns[campID].investedCampaigns[campaigns[campID]
            .investedCount] = investmentCount;
        investors[msg.sender].investedCount =
            investors[msg.sender].investedCount +
            1;
        investors[msg.sender].investedCampaigns[investors[msg.sender]
            .investedCount] = investmentCount;
    }

    function campaignInvestedDetails(uint256 campID, uint32 index)
        public
        view
        returns (address, uint256, uint256)
    {
        uint256 detailIndex = campaigns[campID].investedCampaigns[index];
        return (
            investedCampaigns[detailIndex].investedBy,
            investedCampaigns[detailIndex].amount,
            investedCampaigns[detailIndex].balance
        );
    }

    function investorInvestedDetails(uint32 index)
        public
        view
        returns (uint256)
    {
        uint256 detailIndex = investors[msg.sender].investedCampaigns[index];
        return investedCampaigns[detailIndex].campID;
    }

    // Requesting Payment
    function requestPayment(
        address payable recipient,
        address payer,
        uint256 campID,
        bytes memory campTitle,
        uint256 amount,
        bytes memory purpose
    ) public {
        requestCount = requestCount + 1;
        requests[requestCount].campID = campID;
        requests[requestCount].campTitle = campTitle;
        requests[requestCount].recipient = recipient;
        requests[requestCount].payer = payer;
        requests[requestCount].purpose = purpose;
        requests[requestCount].amount = amount;
        requests[requestCount].status = 0;

        campaigns[campID].requestCount = campaigns[campID].requestCount + 1;
        campaigns[campID].requests[campaigns[campID]
            .requestCount] = requestCount;

        investors[payer].requestCount = investors[payer].requestCount + 1;
        investors[payer].requests[investors[payer].requestCount] = requestCount;
    }

    // Respond Payment
    function respondPayment(uint256 requestID, uint256 responce) public {
        address payable recipient = requests[requestID].recipient;
        if (requests[requestID].status == 2) {
            revert("already Rejected");
        } else {
            requests[requestID].status = responce;
            if (responce == 1) {
                recipient.transfer(requests[requestID].amount * 1000000000000000000);
            }
        }
    }

    function campaignrequestDetails(uint256 campID, uint32 index)
        public
        view
        returns (address, address, bytes memory, uint256, uint256)
    {
        uint256 detailIndex = campaigns[campID].requests[index];
        return (
            requests[detailIndex].recipient,
            requests[detailIndex].payer,
            requests[detailIndex].purpose,
            requests[detailIndex].amount,
            requests[detailIndex].status
        );
    }

    function investorrequestDetails(uint32 index)
        public
        view
        returns (address, bytes memory, bytes memory, uint256, uint256, uint256)
    {
        uint256 detailIndex = investors[msg.sender].requests[index];
        return (
            requests[detailIndex].recipient,
            requests[detailIndex].campTitle,
            requests[detailIndex].purpose,
            requests[detailIndex].amount,
            requests[detailIndex].status,
            detailIndex
        );
    }
}
