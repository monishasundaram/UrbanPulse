const { createWalletClient, createPublicClient, http } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { hardhat } = require('viem/chains');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Simple SHA256 hash function (no blockchain connection needed)
function generateComplaintHash(complaintId, title, createdAt) {
  return crypto
    .createHash('sha256')
    .update(complaintId + title + createdAt)
    .digest('hex');
}

module.exports = { generateComplaintHash };