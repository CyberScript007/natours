class ApiFeatures {
  constructor(queryString, query) {
    this.queryString = queryString;

    this.query = query;
  }

  filter() {
    // 1) Filtering
    let queryObj = { ...this.queryString };
    const excludeFields = ['page', 'fields', 'sort', 'limit'];

    excludeFields.forEach((el) => delete queryObj[el]);

    queryObj = JSON.stringify(queryObj);

    queryObj = queryObj.replace(/\b(lt|lte|gt|gte)\b/g, '$$$1');

    queryObj = JSON.parse(queryObj);

    this.query = this.query.find(queryObj);

    return this;
  }

  sort() {
    // 2) Sorting
    if (this.queryString.sort) {
      const queryStr = this.queryString.sort.split(',').join(' ');

      this.query = this.query.sort(queryStr);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  selectFields() {
    // 3) Selecting Fields
    if (this.queryString.fields) {
      const queryStr = this.queryString.fields.split(',').join(' ');

      this.query = this.query.select(queryStr);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  pagination() {
    // 4) Pagination
    const pages = Number(this.queryString.page) || 1;

    const limit = Number(this.queryString.limit) || 100;

    const skip = (pages - 1) * limit;

    // const AllTours = await Tour.countDocuments();

    // if (skip >= AllTours) throw new Error('This page is not found');

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = ApiFeatures;
