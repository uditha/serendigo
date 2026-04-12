import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { getOffers, postRedeem } from '../handlers/redemption.handler'

const redeem = new Hono()

redeem.get('/:partnerId', getOffers)        // public — scan QR, show offers
redeem.post('/', authMiddleware, postRedeem) // auth — spend coins

export default redeem
