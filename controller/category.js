const categoryModal = require('../models/catagory')


//catgory Add page rendering
const catgoryAdd = async (req, res) => {
    try {
        res.render('admin/catagory', { admin: req.session.admin, categoryAdd: true })
    } catch (err) {
        console.log(err.message + '       catgory route ')
        res.status(400)
    }
}

//get catagory add 
const getcatgoryAdd = async (req, res) => {
    try {
        const category = await categoryModal.create({
            name: req.body.name,
            gender: req.body.gender,
            active: req.body.active
        });
        res.redirect('/admin/category');
    } catch (err) {
        console.log(err.message + '          getting castgory  ')
        res.status(400)
    }
}

//category dets page rendering
const category = async (req, res) => {
    try {
        const categorys = await categoryModal.find({})
        if (categorys) {
            res.render('admin/catagoryDet', { categorys, admin: req.session.admin, category: true })
        }
    } catch (er) {
        console.log(er.message + '    category dets ')
        res.status(400)
    }
}

// catgory fetch 
const categoryFetch = async (req, res) => {
    try {
        const pattern = new RegExp(`^${req.body.name}$`, 'i');
        const category = await categoryModal.findOne({ name: pattern });
        const exist = !!category;
        res.send({ exist });
    } catch (err) {
        console.log(err.message + '     category fetch route ')
        res.status(400)
    }
}

// category remove
const categorydlt = async (req, res) => {
    try {
        const dltCat = await categoryModal.findOneAndDelete({ _id: req.query.id })
        res.redirect('/admin/catagory')
    } catch (err) {
        console.log(err.message + '        categorydlt')
        res.status(400)
    }
}

//category 
const catgoryActive = async (req, res) => {
    try {

        const activeornot = await categoryModal.findOne({ _id: req.body.payload })
      
        if (activeornot.active) {
            const activetrue = await categoryModal.findOneAndUpdate({ _id: req.body.payload }, { $set: { active: false } })

            if (activetrue._id) {

                const updatedData = await categoryModal.findOne({ _id: activetrue._id });

                res.send({ updatedData, blocked: 'is blocked' });
            }
        } else {
            const activetrue = await categoryModal.findOneAndUpdate({ _id: req.body.payload }, { $set: { active: true } })


            if (activetrue._id) {

                const updatedData = await categoryModal.findOne({ _id: activetrue._id });

                res.send({ updatedData });
            }
        }

    } catch (err) {
        console.log(err.message + '       bloack fetching data')
        res.status(400)
    }
}

module.exports = {
    catgoryAdd,
    categoryFetch,
    category,
    getcatgoryAdd,
    categorydlt,
    catgoryActive
}