import bsv from 'babbage-bsv'
import pushdrop from 'pushdrop'
import { ERR_HISTORIAN_INVALID_SIG, ERR_HISTORIAN_INVALID_TOKEN } from './ERR_SIGNIA'

/**
 * Interprets the history of a token BRC-8 envelope
 * @public
 */
export class Historian {
  /**
   * Constructs a historian to interpret token history
   * @public
   * @param correctOwnerKey - the ownerKey used in pushdrop to create the locking script
   * @param correctSigningKey - the signing key that should have been used
   * @param validate - validation function to filter history
   */
  constructor (
      public correctOwnerKey, 
      public correctSigningKey,
      private validate
    ) {
    this.correctOwnerKey = correctOwnerKey
    this.correctSigningKey = correctSigningKey
    if (validate) {
      this.validate = validate
    } else {
      this.validate = (value) => { return true }
    }
  }

  /**
   * Recursive function for interpreting the history of a token
   * @public
   * @param currentEnvelope
   * @param currentDepth 
   * @returns 
   */
  async interpret (currentEnvelope, currentDepth): Promise<Array<string>> {
    // Make sure the inputs are given as a string...?
    if (typeof currentEnvelope.inputs === 'string') {
      currentEnvelope.inputs = JSON.parse(currentEnvelope.inputs)
    }

    let valueHistory:string[] = []

    // Handle the current value first
    if (currentDepth === 0) {
      const tokenValue = await this.decodeTokenValue(currentEnvelope)
      if (tokenValue && this.validate(tokenValue)) {
        valueHistory.push(tokenValue)
      }
    }

    // If there are no more inputs for this branch, return no value history
    if (currentEnvelope.inputs === undefined || Object.keys(currentEnvelope.inputs).length === 0) {
      return []
    }

    if (currentEnvelope.inputs && typeof currentEnvelope.inputs === 'object') {
      for (const inputEnvelope of Object.values(currentEnvelope.inputs)) {
        const tokenValue = await this.decodeTokenValue(inputEnvelope)
        if (tokenValue && this.validate(tokenValue)) {
          valueHistory.push(tokenValue)
        }
        const previousHistory = await this.interpret(inputEnvelope, currentDepth + 1)
        if (previousHistory && previousHistory.length > 0) {
          valueHistory = [...valueHistory, ...previousHistory]
        }
      }
    }

    // Return the history and apply a filter
    return valueHistory.flat()
  }

  /**
   * Decodes a pushdrop token 
   * TODO: Update to support other data structures! --> Currently coded for kvstore tokens
   * @public
   * @param inputEnvelope 
   * @returns 
   */
  async decodeTokenValue (inputEnvelope) {
    try {
      // Decode the data from the current output
      const decoded = await pushdrop.decode({
        script: inputEnvelope.outputScript,
        fieldFormat: 'buffer'
      })
      if (decoded.lockingPublicKey !== this.correctOwnerKey) {
        throw new ERR_HISTORIAN_INVALID_TOKEN('Token is not from correct key!')
      }
      // Use ECDSA to verify signature
      const hasValidSignature = bsv.crypto.ECDSA.verify(
        bsv.crypto.Hash.sha256(Buffer.concat(decoded.fields)),
        bsv.crypto.Signature.fromString(decoded.signature),
        bsv.PublicKey.fromString(this.correctSigningKey)
      )
      if (!hasValidSignature) {
        throw new ERR_HISTORIAN_INVALID_SIG()
      }
      return decoded.fields[1].toString()
    } catch (error) {
      console.error(error)
    }
  }
}
