<template lang="pug">
  .project-card
    h2.project-card__title {{ data.name }}
    .project-card__content {{ data.description || '暂无描述信息' }}
    .project-card__date 更新于 {{ data.updatedAt | fromNow }}

    .project-card__header
      .one
      .two
      .three
</template>

<script>
import moment from 'moment'
moment.locale('zh-CN')

export default {
  props: [
    'data'
  ],

  filters: {
    fromNow (value) {
      return moment(value).fromNow()
    }
  }
}
</script>
