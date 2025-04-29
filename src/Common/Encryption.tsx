import React, { useState } from 'react'
import forge from 'node-forge';

const decodeBase64 = (encodedString: string): string => {
    try {
        // Use atob() to decode the base64 string
        const decodedString = atob(encodedString);
        return decodedString;
    } catch (error) {
        // Log the error and throw it to be handled by the caller
        console.error("Failed to decode base64 string:", error);
        throw new Error("Invalid base64 string");
    }
};
export const encryptHybridMessage = async (message: string): Promise<string> => {
    try {
        const publicKeyPem: string = process.env.REACT_APP_ENCRYPTION_PUBLIC_KEY as string;
        const decodedString = decodeBase64(publicKeyPem)
        const publicKey = forge.pki.publicKeyFromPem(decodedString);

        // Generate a random AES key
        const aesKey = forge.random.getBytesSync(32); // 32 bytes = 256 bits

        // Encrypt the message with the AES key
        const cipher = forge.cipher.createCipher('AES-GCM', aesKey);
        const iv = forge.random.getBytesSync(12);
        cipher.start({ iv: iv });
        cipher.update(forge.util.createBuffer(message));
        cipher.finish();
        const encryptedMessage = cipher.output.getBytes();
        const tag = cipher.mode.tag.getBytes();

        // Encrypt the AES key with the RSA public key
        const encryptedKey = publicKey.encrypt(aesKey, 'RSA-OAEP', {
            md: forge.md.sha256.create(),
            mgf: forge.mgf.mgf1.create(forge.md.sha1.create())
        });

        // Encode the encrypted data for transmission
        const payload = {
            iv: forge.util.encode64(iv),
            key: forge.util.encode64(encryptedKey),
            message: forge.util.encode64(encryptedMessage),
            tag: forge.util.encode64(tag)
        };

        // Convert the payload to a JSON string
        const jsonString = JSON.stringify(payload);

        return jsonString;
    } catch (error) {
        throw error;
    }
};