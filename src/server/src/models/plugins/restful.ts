import { Schema } from 'mongoose'
import { omit, isUndefined } from 'lodash'

export default function restfulPlugin (schema: Schema, options?: Object): void {
  schema.statics.list = function (this: any, query: any) {
    let {
      fields,
      page = 0,
      per_page = 50,
    } = query

    const {
      populate,
      sort,
      count,
    } = query
    const conditions = omit(query, ['page', 'per_page', 'sort', 'fields', 'count', 'populate' ])

    if (!isUndefined(fields)) {
      fields = fields.split(',')
    }

    const option: any = {}

    if (!isUndefined(per_page)) {
      per_page = +per_page
      if (isUndefined(page)) {
        page = 0
      }
      option.skip = page * per_page
      option.limit = per_page
    }

    let q = this.find(conditions, fields, option)

    if (!isUndefined(sort)) {
      sort.split(',').forEach((field: any) => q = q.sort(field))
    }

    if (!isUndefined(populate)) {
      populate.split(',').forEach((field: any) => q = q.populate(field))
    }

    if (!isUndefined(count)) {
      q = q.count()
    }

    return q.exec()
  }

}
