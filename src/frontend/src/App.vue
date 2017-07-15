<template lang="pug">
  #app
    navbar(v-if="needAuth")
    router-view
</template>

<script>
import Navbar from '@/components/navbar'
export default {
  name: 'app',

  components: {
    Navbar
  },

  computed: {
    needAuth () {
      return [
        'Login',
        "Signup"
      ].indexOf(this.$route.name) === -1
    }
  }
}
</script>
