<template lang="pug">
  #page-login
    .login-box
      h2.login-box__title 登录
      .login-box__content
        el-form(
          :model="loginForm"
          label-position="top"
          :rules="rules"
          ref="loginForm"
        )
          el-form-item(label="用户名", prop="username")
            el-input(v-model="loginForm.username", autofocus)
          el-form-item(label="密码", prop="password")
            el-input(
              v-model="loginForm.password"
              type="password"
              @keydown.native.enter="login"
            )

          .login-box__hint
            span 没有账号？点击
            router-link(to="signup") 注册

          el-button(
            type="primary"
            @click="login"
          ) 登录

</template>

<script>
import api from '@/api'

export default {
  data () {
    return {
      loginForm: {
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
    async login () {
      this
        .$refs
        .loginForm
        .validate(async valid => {
          if (valid) {
            try {
              const { data: token } = await api.user.login(this.loginForm.username, this.loginForm.password)
              window.sessionStorage.token = token
              const {
                from
              } = this.$route.query
              if (from) {
                window.location.href = from
              } else {
                this.$router.push('/list')
              }
            } catch (ignore) {}
          }
        })
    }
  }


}
</script>
