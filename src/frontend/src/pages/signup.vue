<template lang="pug">
  #page-signup
    .login-box
      h2.login-box__title 注册
      .login-box__content
        el-form(
          :model="signupForm"
          label-position="top"
          :rules="rules"
          ref="signupForm"
        )
          el-form-item(label="用户名", prop="username")
            el-input(v-model="signupForm.username", autofocus)
          el-form-item(label="密码", prop="password")
            el-input(
              v-model="signupForm.password"
              type="password"
              @keydown.native.enter="signup"
            )
          .login-box__hint
            span 已有账号？点击
            router-link(to="login") 登录

          el-button(
            type="primary"
            @click="signup"
          ) 注册

</template>

<script>
import api from '@/api'

export default {
  data () {
    return {
      signupForm: {
        username: '',
        password: ''
      },

      rules: {
        username: [
          { required: true, message: '用户名不能为空', trigger: 'change' }
        ],
        password: [
          { required: true, message: '密码不能为空', trigger: 'change' }
        ]
      }

    }
  },

  created () {
    if (window.sessionStorage.token) {
      const {
        from
      } = this.$route.query
      if (from) {
        window.location.href = from
      } else {
        this.$router.push('/list')
      }
    }
  },

  methods: {
    async signup () {
      this
        .$refs
        .signupForm
        .validate(async valid => {
          if (valid) {
            try {
              const { data: token } = await api.user.signup(this.signupForm.username, this.signupForm.password)
              window.sessionStorage.token = token
              const {
                from
              } = this.$route.query
              if (from) {
                window.location.href = from
              } else {
                this.$router.push('/list')
              }
            } catch (e) {
              this.$message.error(e.response.data.message)
            }
          }
        })
    }
  }


}
</script>
