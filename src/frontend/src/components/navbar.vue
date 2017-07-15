<template lang="pug">
  nav.navbar
    span.username {{ me.username }}
    span.btn(@click="exit") 退出
</template>

<script>
import api from '@/api'

export default {
  data () {
    return {
      me: ''
    }
  },

  created () {
    this.init()
  },

  methods: {
    async init () {
      const { data:me } = await api.user.me()
      this.me = me
    },

    exit () {
      window.sessionStorage.removeItem('token')
      this.$router.push('/login')
    }
  }
}
</script>
