import _forEach from 'lodash/forEach'
import moment from 'moment'


exports.taskTemplate = (task) => {
    const now = moment()
    const deadline = moment(task.deadline)

    if (task.deadline) {
        return `<strong>${task.title.toUpperCase()}</strong>
        <pre>${task.content}</pre>
        <pre>ends ${deadline.from(now)}</pre>`
    } else {
        return `<strong>${task.title.toUpperCase()}</strong>
        <pre>${task.content}</pre>`
    }
}


exports.tasksTemplate = (tasks) => {
    let result = ``
    let now = moment()

    _forEach(tasks, task => {
        if (task.deadline) {
            let deadline = moment(task.deadline)

            result += `<strong> ${task.title.toUpperCase()}</strong >
            <pre>${task.content}</pre>
            <pre>ends ${deadline.from(now)}</pre>
            <pre>-----------</pre>`
        } else {
            result += `<strong> ${task.title.toUpperCase()}</strong >
            <pre>${task.content}</pre>
            <pre>-----------</pre>`
        }
    })

    return result
}