import fs from 'fs';
import { Keypair } from '@solana/web3.js';
import { derivePath } from 'ed25519-hd-key';
import * as nacl from 'tweetnacl';
import * as path from 'path';

const USER_KEYPAIR_PATH = path.join(__dirname, '..', 'solana-wallet.json');

// Load keypair from file
function loadKeypairFromFile(filePath: string): Keypair {
    try {
        const fileContent = fs.readFileSync(filePath, { encoding: 'utf8' });
        const secretKeyArray = JSON.parse(fileContent);
        return Keypair.fromSecretKey(Uint8Array.from(secretKeyArray));
    } catch (error) {
        console.error(`Errore durante il caricamento della chiave privata da ${filePath}:`, error);
        process.exit(1);
    }
}

// Derive keypair from seed and derivation path
function deriveKeypairFromSeed(seed: Buffer, derivationPath: string): Keypair {
    console.log('Derivation path:', derivationPath);
    const derivedSeed = derivePath(derivationPath, seed.toString('hex')).key;
    console.log('Derived seed:', derivedSeed);
    const keypair = nacl.sign.keyPair.fromSeed(derivedSeed);
    return Keypair.fromSecretKey(new Uint8Array([...keypair.secretKey]));
}

// Get user keypair, optionally using a derivation path
export function getUserKeypair(derivationPath?: string): Keypair {
    const keypair = loadKeypairFromFile(USER_KEYPAIR_PATH);
    if (derivationPath) {
        const seed = keypair.secretKey.slice(0, 32); // Assume the seed is the first 32 bytes of the secret key
        return deriveKeypairFromSeed(Buffer.from(seed), derivationPath);
    }
    return keypair;
}

// Main function to load keypair
export function loadKeypair(): Keypair {
    if (fs.existsSync(USER_KEYPAIR_PATH)) {
        return getUserKeypair();
    } else {
        console.error('Private key file or mnemonic not found');
        console.error('Please set SOLANA_MNEMONIC environment variable or create a private key file at', USER_KEYPAIR_PATH);
        process.exit(1);
    }
}
