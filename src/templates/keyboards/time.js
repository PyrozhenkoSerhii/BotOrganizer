import { time } from '../../utils/buttons'

export default [
    [
        {
            text: time.today,
            callback_data: time.today
        }
    ],
    [
        {
            text: time.tomorrow,
            callback_data: time.tomorrow
        }
    ],
    [
        {
            text: time.any,
            callback_data: time.any
        }
    ]
]
