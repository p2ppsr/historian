/* eslint-disable @typescript-eslint/no-unused-vars */
import { Historian } from '../src/Historian'
import SDK from '@babbage/sdk-ts'
import pushdrop from 'pushdrop'
import bsv from 'babbage-bsv'

let correctOwnerKey, correctSigningKey, latestEnvelope

// NOTE: PushDrop.Create might have a bug when using a hardcoded private key... check this with Ty.
const MOCK_PRIV_KEY = new bsv.PrivateKey('71f8516ad8b8ea99b5378973a126fca3208229f1bafd05e2f1c733245fca8579')
const MOCK_PUB_KEY = MOCK_PRIV_KEY.publicKey.toString('hex')

const updateValue = async (updatedValue) => {
    const unlockingScript = await pushdrop.redeem({
        prevTxId: latestEnvelope.txid,
        outputIndex: latestEnvelope.vout,
        lockingScript: latestEnvelope.outputScript,
        outputAmount: latestEnvelope.satoshis,
        key: MOCK_PRIV_KEY.toString('hex'),
        // protocolID: 'kvstore',
        // keyID: '1',
        counterparty: 'self'
      })

      const lockingScript = await pushdrop.create({
        fields: [
          'id',
          updatedValue
        ],
        // protocolID: 'kvstore',
        // keyID: '1',
        key: MOCK_PRIV_KEY.toString('hex'),
        counterparty: 'self'
      })
  
      const action = await SDK.createAction({
        description: 'Update the value',
        inputs: {
          [latestEnvelope.txid]: {
            ...latestEnvelope,
            inputs: typeof latestEnvelope.inputs === 'string'
              ? JSON.parse(latestEnvelope.inputs)
              : latestEnvelope.inputs,
            mapiResponses: typeof latestEnvelope.mapiResponses === 'string'
              ? JSON.parse(latestEnvelope.mapiResponses)
              : latestEnvelope.mapiResponses,
            proof: typeof latestEnvelope.proof === 'string'
              ? JSON.parse(latestEnvelope.proof)
              : latestEnvelope.proof,
            outputsToRedeem: [{
              index: latestEnvelope.vout,
              unlockingScript
            }]
          }
        },
        outputs: [{
          satoshis: 1,
          script: lockingScript
        }]
      })
      latestEnvelope = {
        ...action,
        outputScript: lockingScript,
        vout: 0,
        satoshis: 1
    }
}

const setNewValue = async (newValue) => {
    const lockingScript = await pushdrop.create({
        fields: [
          'id',
          newValue
        ],
        key: MOCK_PRIV_KEY.toString('hex'),
        counterparty: 'self'
    })
    const action = await SDK.createAction({
        description: 'Set a value for',
        outputs: [{
          satoshis: 1,
          script: lockingScript
        }]
    })
    latestEnvelope = {
        ...action,
        outputScript: lockingScript,
        vout: 0,
        satoshis: 1
    }
}

describe('TODO', () => {
    beforeAll(async () => {  
        // correctOwnerKey = await SDK.getPublicKey({
        //     protocolID: 'kvstore',
        //     keyID: '1',
        //     counterparty: 'self',
        //     forSelf: true
        // })
        // correctSigningKey = await SDK.getPublicKey({
        //     protocolID: 'kvstore',
        //     keyID: '1',
        //     counterparty: 'self',
        //     forSelf: false
        // })
    })

    it('Test invalid envelope to interpret', async () => {
        const historian = new Historian(correctOwnerKey, correctSigningKey)
        await historian.interpret({}, 0)
    })
    it('Returns history single update', async () => {
        const historian = new Historian(MOCK_PUB_KEY, MOCK_PUB_KEY)
        await setNewValue('defaultValue')

        const valueHistory = await historian.interpret(latestEnvelope, 0)
        expect(valueHistory).toEqual(['defaultValue'])
    })
    it('Returns history for several updates', async () => {
        const historian = new Historian(MOCK_PUB_KEY, MOCK_PUB_KEY)

        await setNewValue('defaultValue')
        await updateValue('updated1')
        await updateValue('currentValue')

        const valueHistory = await historian.interpret(latestEnvelope, 0)
        expect(valueHistory).toEqual(['currentValue', 'updated1', 'defaultValue'])
    })
    it('Returns only valid history from several updates', async () => {
        const historian = new Historian(correctOwnerKey, correctSigningKey, (value) => {
            if (value === 'updated1') {
                return true
            }
            return false
        })

        await setNewValue('defaultValue')
        await updateValue('updated1')
        await updateValue('currentValue')

        const valueHistory = await historian.interpret(latestEnvelope, 0)
        expect(valueHistory).toEqual(['updated1'])
    })
})