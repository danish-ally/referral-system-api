const validatePayload = (payload) => {
    // Validate channelInfo if it exists and is not null
    if (payload.channelInfo !== null && (!payload.channelInfo || typeof payload.channelInfo !== 'object')) {
        return false;
    }

    // Validate planId
    if (!payload.planId || typeof payload.planId !== 'string') {
        return false;
    }

    // Validate discountType
    if (!payload.discountType || typeof payload.discountType !== 'string') {
        return false;
    }

    // Validate discountAmount
    if (typeof payload.discountAmount !== 'number') {
        return false;
    }


    // Validate courseType
    return !(!payload.courseType || typeof payload.courseType !== 'string');
};

module.exports = validatePayload;
