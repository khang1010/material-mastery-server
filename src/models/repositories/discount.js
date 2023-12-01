const { getSelectData, getUnSelectData, getSortAscending, getSortDescending } = require("../../utils");
const discountModel = require("../discount.model")

const findDiscountByCode = async ({code}) => {
    const foundDiscount = await discountModel.findOne({
        discount_code: code,
    }).lean();

    return foundDiscount
}

const findDiscountById = async (discountId) => {
    return await discountModel.findById(discountId).lean();
}

const getAllDiscountCodesUnselect = async ({limit = 50, page = 1, sorted = ["_id"], filter = {}, unselect = [], isAscending = true}) => {
    return await discountModel.find(filter)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort(isAscending === 'true' ? getSortAscending(sorted) : getSortDescending(sorted))
    .select(getUnSelectData(unselect))
    .lean()
}

const getAllDiscountCodesSelect = async ({limit = 50, page = 1, sorted = ["_id"], filter = {}, select = [], isAscending = true}) => {
    return await discountModel.find(filter)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort(isAscending === 'true' ? getSortAscending(sorted) : getSortDescending(sorted))
    .select(getSelectData(select))
    .lean()
}

const deleteDiscountCode = async ({code}) => {
    return await discountModel.findOneAndDelete({
        discount_code: code,
    })
}

const updateDiscountCode = async (discountId, update) => {
    return await discountModel.findByIdAndUpdate(discountId, update, {new: true})
}

const cancelDiscountCode = async ({codeId, userId}) => {
    return await discountModel.findByIdAndUpdate(codeId, {
        $pull: {
            discount_user_used: userId,
        },
        $inc: {
            discount_uses_count: -1,
            discount_max_uses: 1,
        }
    })
}

module.exports = {
    findDiscountByCode,
    getAllDiscountCodesSelect,
    getAllDiscountCodesUnselect,
    deleteDiscountCode,
    updateDiscountCode,
    cancelDiscountCode,
    findDiscountById,
}