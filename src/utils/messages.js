/**
 * 
 * @param {string} text Message Text
 * @returns {object} An object of {text, createdAt}
 */

export const generateMessage = (username, text) => {
    return {
        username,
        text,
        createdAt : new Date().getTime()
    }
}

/**
 * 
 * @param {string} username
 * @param {object} coords { latitude, longitude }
 * @returns {object}  An object of {url, createdAt}
 */

export const generateLocationMessage = (username, coords) => {
    return {
        username,
        url : `https://google.com/maps?q=${coords.latitude},${coords.longitude}`,
        createdAt : new Date().getTime()
    }
}