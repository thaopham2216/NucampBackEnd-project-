const express = require('express');
const Destination = require('../models/destination');
const authenticate = require('../authenticate');
const cors = require('./cors');

const destinationRouter = express.Router();

destinationRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res, next) => {
        Destination.find()
            .populate('comments.author')
            .then(destinations => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(destinations);
            })
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Destination.create(req.body)
            .then(destination => {
                console.log('Destination Created ', destination);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(destination);
            })
            .catch(err => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /destinations');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Destination.deleteMany()
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
    });
//////////////////////////////////////////////////////////////////////////////
destinationRouter.route('/:destinationId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res, next) => {
        Destination.findById(req.params.destinationId)
            .populate('comments.author')
            .then(destination => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(destination);
            })
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /destinations/${req.params.destinationId}`);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Destination.findByIdAndUpdate(req.params.destinationId, {
            $set: req.body
        }, { new: true })
            .then(destination => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(destination);
            })
            .catch(err => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Destination.findByIdAndDelete(req.params.destinationId)
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
    });
//////////////////////////////////////////////////////////////////////////////////////
destinationRouter.route('/:destinationId/comments')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res, next) => {
        Destination.findById(req.params.destinationId)
            .populate('comments.author')
            .then(destination => {
                if (destination) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(destination.comments);
                } else {
                    err = new Error(`Destination ${req.params.destinationId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Destination.findById(req.params.destinationId)
            .then(destination => {
                if (destination) {
                    //console.log("data",destination)
                    //console.log("body",req.body)
                    req.body.author = req.user._id;
                    destination.comments.push(req.body);
                    destination.save()
                        .then(destination => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(destination);
                        })
                        .catch(err => next(err));
                } else {
                    err = new Error(`Destination ${req.params.destinationId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /destinations/${req.params.destinationId}/comments`);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Destination.findById(req.params.destinationId)
            .then(destination => {
                if (destination) {
                    for (let i = (destination.comments.length - 1); i >= 0; i--) {
                        destination.comments.id(destination.comments[i]._id).remove();
                    }
                    destination.save()
                        .then(destination => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(destination);
                        })
                        .catch(err => next(err));
                } else {
                    err = new Error(`Destination ${req.params.destinationId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    });
//////////////////////////////////////////////////////////////////////////////////////
destinationRouter.route('/:destinationId/comments/:commentId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res, next) => {
        Destination.findById(req.params.destinationId)
            .populate('comments.author')
            .then(destination => {
                if (destination && destination.comments.id(req.params.commentId)) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(destination.comments.id(req.params.commentId));
                } else if (!destination) {
                    err = new Error(`Destination ${req.params.destinationId} not found`);
                    err.status = 404;
                    return next(err);
                } else {
                    err = new Error(`Comment ${req.params.commentId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /destinations/${req.params.destinationId}/comments/${req.params.commentId}`);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        console.log('updating comment')
        Destination.findById(req.params.destinationId)
            .then(destination => {
                if (destination && destination.comments.id(req.params.commentId)) {
                    if ((req.user._id).equals(destination.comments.id(req.params.commentId).author)) {
                        console.log('You are the author')
                        if (req.body.rating) {
                            destination.comments.id(req.params.commentId).rating = req.body.rating;
                        }
                        if (req.body.text) {
                            destination.comments.id(req.params.commentId).text = req.body.text;
                        }
                        destination.save()
                            .then(destination => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(destination);
                            })
                            .catch(err => next(err))
                    } else {
                        err = new Error(`${req.user._id} is not authorized to update this comment.`);
                        err.status = 403;
                        return next(err);
                    }
                } else if (!destination) {
                    err = new Error(`Destination ${req.params.destinationId} not found`);
                    err.status = 404;
                    return next(err);
                } else {
                    err = new Error(`Comment ${req.params.commentId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Destination.findById(req.params.destinationId)
            .then(destination => {
                if (destination && destination.comments.id(req.params.commentId)) {
                    if ((req.user._id).equals(destination.comments.id(req.params.commentId).author)) {
                        console.log('You are the author')
                        destination.comments.id(req.params.commentId).remove();
                        destination.save()
                            .then(destination => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(destination);
                            }).catch(err => next(err));
                    } else {
                        err = new Error(`${req.user._id} is not authorized to delete this comment.`);
                        err.status = 403;
                        return next(err);
                    }
                } else if (!destination) {
                    err = new Error(`Destination ${req.params.destinationId} not found`);
                    err.status = 404;
                    return next(err);
                } else {
                    err = new Error(`Comment ${req.params.commentId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    });

module.exports = destinationRouter;