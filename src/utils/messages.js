/**
 * 
 * @param {string} text Message Text
 * @returns {object} An object of {text, createdAt}
 */

export const generateMessage = (text) => {
    return {
        text,
        createdAt : new Date().getTime()
    }
}

/**
 * 
 * @param {string} url Uniform Resource Locater
 * @returns {object}  An object of {url, createdAt}
 */

export const generateLocationMessage = (url) => {
    return {
        url,
        createdAt : new Date().getTime()
    }
}