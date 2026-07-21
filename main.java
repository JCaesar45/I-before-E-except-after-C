package io.aether.vault.crypto;

import java.security.*;
import java.util.Base64;
import java.util.logging.Level;
import java.util.logging.Logger;

public class Ed25519SignatureVerifier {

    private static final Logger LOGGER = Logger.getLogger(Ed25519SignatureVerifier.class.getName());
    private static final String ALGORITHM = "Ed25519";

    private final PublicKey publicKey;

    public Ed25519SignatureVerifier(byte[] publicKeyBytes) throws NoSuchAlgorithmException, InvalidKeySpecException {
        KeyFactory keyFactory = KeyFactory.getInstance(ALGORITHM);
        this.publicKey = keyFactory.generatePublic(
            new java.security.spec.X509EncodedKeySpec(publicKeyBytes)
        );
    }

    public boolean verify(String message, String signatureBase64) {
        try {
            Signature signature = Signature.getInstance(ALGORITHM);
            signature.initVerify(this.publicKey);
            
            byte[] messageBytes = message.getBytes(java.nio.charset.StandardCharsets.UTF_8);
            byte[] signatureBytes = Base64.getDecoder().decode(signatureBase64);
            
            signature.update(messageBytes);
            return signature.verify(signatureBytes);
            
        } catch (NoSuchAlgorithmException | InvalidKeyException | SignatureException | IllegalArgumentException e) {
            LOGGER.log(Level.SEVERE, "Signature verification failed", e);
            return false;
        }
    }

    public static byte[] generateKeyPair() throws NoSuchAlgorithmException {
        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance(ALGORITHM);
        KeyPair keyPair = keyPairGenerator.generateKeyPair();
        return keyPair.getPublic().getEncoded();
    }
}
