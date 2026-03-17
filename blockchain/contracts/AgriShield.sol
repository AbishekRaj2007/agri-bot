// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AgriShield
 * @notice On-chain crop event ledger for Indian farmers.
 *         Farmers can log "planted" and "harvested" events for each crop.
 *         All events are permanently stored and publicly queryable by farmer address.
 *
 * Deployment:
 *   npx hardhat run scripts/deploy.ts --network sepolia    (from blockchain/ folder)
 *
 * After deployment add to root .env:
 *   VITE_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_ADDRESS
 */
contract AgriShield {

    // ─── Structs ──────────────────────────────────────────────────────────────

    struct CropEvent {
        address farmer;       // wallet address of the farmer
        string  cropName;     // e.g. "Swarna Sub-1 Rice", "HD 3226 Wheat"
        string  eventType;    // "planted" | "harvested"
        uint256 timestamp;    // block.timestamp at the time of logging
        string  location;     // state/district e.g. "Punjab, Ludhiana"
    }

    // ─── Storage ──────────────────────────────────────────────────────────────

    /// @dev All crop events logged by all farmers
    CropEvent[] private _allEvents;

    // ─── Events ───────────────────────────────────────────────────────────────

    /**
     * @notice Emitted whenever a farmer logs a crop event.
     * @param farmer    The farmer's wallet address (indexed for filtering)
     * @param cropName  Name of the crop
     * @param eventType "planted" or "harvested"
     * @param timestamp Unix timestamp of the block
     */
    event CropLogged(
        address indexed farmer,
        string          cropName,
        string          eventType,
        uint256         timestamp
    );

    // ─── Functions ────────────────────────────────────────────────────────────

    /**
     * @notice Log a crop event for the calling farmer.
     * @param cropName  Name of the crop being logged
     * @param eventType Must be "planted" or "harvested"
     * @param location  Human-readable location string (state, district)
     */
    function logCropEvent(
        string calldata cropName,
        string calldata eventType,
        string calldata location
    ) external {
        require(bytes(cropName).length > 0,  "AgriShield: cropName is required");
        require(bytes(eventType).length > 0, "AgriShield: eventType is required");
        require(bytes(location).length  > 0, "AgriShield: location is required");

        CropEvent memory newEvent = CropEvent({
            farmer:    msg.sender,
            cropName:  cropName,
            eventType: eventType,
            timestamp: block.timestamp,
            location:  location
        });

        _allEvents.push(newEvent);

        emit CropLogged(msg.sender, cropName, eventType, block.timestamp);
    }

    /**
     * @notice Return all crop events that belong to a specific farmer.
     * @param farmer The wallet address to filter by
     * @return Array of CropEvent structs for that farmer only
     *
     * @dev Two-pass algorithm: first counts matches, then fills the result array.
     *      Gas cost scales linearly with total stored events — acceptable for
     *      the expected volume of an individual farmer's crop history.
     */
    function getCropEvents(address farmer)
        external
        view
        returns (CropEvent[] memory)
    {
        // Pass 1 — count events belonging to this farmer
        uint256 count = 0;
        uint256 total = _allEvents.length;

        for (uint256 i = 0; i < total; i++) {
            if (_allEvents[i].farmer == farmer) {
                count++;
            }
        }

        // Pass 2 — populate result array
        CropEvent[] memory result = new CropEvent[](count);
        uint256 idx = 0;

        for (uint256 i = 0; i < total; i++) {
            if (_allEvents[i].farmer == farmer) {
                result[idx] = _allEvents[i];
                idx++;
            }
        }

        return result;
    }

    /**
     * @notice Returns the total number of crop events stored across all farmers.
     *         Useful for monitoring contract activity.
     */
    function totalEvents() external view returns (uint256) {
        return _allEvents.length;
    }
}
