
module.exports = function(_id,cec_id,track_id,shared_by,shared_date,is_viewed,created_on,modified_on,track,duration,url) {
    this._id = _id;
    this.cec_id =cec_id;
    this.track_id = track_id;
    this.shared_by = shared_by;
    this.shared_date = shared_date;
    this.is_viewed = is_viewed;
    this.created_on = created_on;
    this.modified_on = modified_on; 
    this.track=track;
    this.duration= duration;
    this.url=url;
    };