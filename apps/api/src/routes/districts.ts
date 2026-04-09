import { Hono } from 'hono'
import * as handlers from '../handlers/districts.handler'

const districtsRouter = new Hono()

districtsRouter.get('/', handlers.getDistricts)

export default districtsRouter
