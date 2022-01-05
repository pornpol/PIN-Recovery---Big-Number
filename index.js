const crypto = require('crypto');
const bs58 = require('bs58')
const BigNumber = require('bignumber.js');

BigNumber.set({ EXPONENTIAL_AT: 1e+9 }) // Almost never return exponential notation

const cid1 = '1204565412398';
const cid2 = '1204565412399';

const key = crypto.randomBytes(32).toString('base64');
const salt = crypto.randomBytes(32).toString('base64');
console.log(`key: ${key}`);
console.log(`salt: ${salt}\n`);

// Generate base58 PIN from Key & Salt
const pin = bs58.encode(crypto
                          .createHash('sha256')
                          .update(key.concat(salt))
                          .digest())
              .substring(0, 6);
console.log(`pin: ${pin}\n`)

// Modified Polynomial Equation: 2 shares (cid, share) -> Linear
// x = 0: Key
// x = 1: Citizen ID
// x = 2: Share
// Create Share from Key & CID
const createShares = (secret, cid) => {
  let bigSecret = BigNumber(Buffer.from(secret, 'base64').toString('hex'), 16);
  let bigCid = BigNumber(cid).pow(6); // TODO: Make CID More Complex

  // Equation
  const share = bigCid.minus(bigSecret).times(2).plus(bigSecret);
  console.log(`------------------------------- cid: ${cid} -----------------------------`)
  console.log(`bigSecret (number): ${bigSecret}, length: ${bigSecret.toString().length}`)
  console.log(`bigCid (number): ${bigCid}`)
  console.log(`share (number): ${share.toString()}`)
console.log(`--------------------------------------------------------------------------------`)

  return Buffer.from(share.toString()).toString('base64')
}

// Generate Key from CID & share
const recoverSecret = (cid, share) => {
  let bigCid = BigNumber(cid).pow(6); // TODO: Make CID More Complex
  let bigShare = BigNumber(Buffer.from(share, 'base64').toString());

  // Equation
  const secret = bigCid.times(2).minus(bigShare)

  return Buffer.from(secret.toString(16), 'hex').toString('base64');
}

///////////////////////// Test //////////////////////////////
const share1 = createShares(key, cid1);
console.log(`share1: ${share1}\n`);

const share2 = createShares(key, cid2);
console.log(`share2: ${share2}\n`);

const recoverSecret1 = recoverSecret(cid1, share1);
const recoverSecret2 = recoverSecret(cid2, share2);
console.log(`recoverSecret1: ${recoverSecret1}`);
console.log(`recoverSecret2: ${recoverSecret2}\n`);

console.log('recoverSecret match: ', (key === recoverSecret1) && (key === recoverSecret2));
//////////////////////////////////////////////////////////////////////
