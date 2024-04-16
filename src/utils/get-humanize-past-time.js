import dayjs from 'dayjs'
const duration = require('dayjs/plugin/duration')
const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(duration)
dayjs.extend(relativeTime)

const getHumanizePastTime = (date_iso_string) =>
	dayjs.duration(dayjs(date_iso_string).diff(dayjs(), 'seconds'), 'seconds').humanize(true)

export default getHumanizePastTime
