<template lang="pug">
#page-list
  .project-list
    h1.project-list__title 项目列表
    el-row(:gutter="20")
      el-col(
        v-for="project in list"
        :key="project._id"
        :span="6"
      )
        project-card(:data="project", @click.native="showDetail(project)")
  .project-add(@click="dialogVisible = true")
    i.el-icon-plus

  el-dialog(v-model="dialogVisible", title="创建新项目")
    el-form(:model="form", :rules="rules", ref="form")
      el-form-item(label="名称", prop="name")
        el-input(v-model="form.name", placeholder="项目名称")
      el-form-item(label="描述", prop="description")
        el-input(v-model="form.description", type="textarea")
      el-form-item(label="环境", prop="env")
        el-input(v-model="env", placeholder="输入环境名 Enter 确认", @keydown.native.enter="addEnv")
      .tags
        el-tag(
          v-for="(env, index) in form.env"
          closable
          type="gray"
          :key="env"
          @close="removeEnv(index)"
        ) {{ env }}
      el-button(type="primary", @click="confirm") 确定
</template>

<script>
import api from '@/api'
import ProjectCard from '@/components/project-card'

export default {
  components: {
    ProjectCard
  },

  data () {
    return {
      list: [],
      dialogVisible: false,
      form: {
        name: '',
        description: '',
        env: [
          'alpha',
          'beta',
          'production'
        ]
      },
      rules: {
        name: [
          { required: true, message: '名称不能为空', trigger: 'change' },
          {
            trigger: 'change',
            validator: (rule, value, cb) => {
              if (!/^[a-z][a-z0-9-]*$/.test(value)) {
                return cb('环境名必需以小写字母开头，且只包含小写字母、数字以及 -')
              }
              return cb()
            }
          }
        ],
        description: [
          { required: true, message: '描述不能为空', trigger: 'change' }
        ],
        env: [
          {
            trigger: 'change',
            validator: (rule, value, cb) => {
              if (!this.env) {
                return cb()
              }
              if (!/^[a-z][a-z0-9-]*$/.test(this.env)) {
                return cb('环境名必需以小写字母开头，且只包含小写字母、数字以及 -')
              }
              if (value.indexOf(this.env) !== -1) {
                return cb('环境已存在')
              }
              return cb()
            }
          }
        ]
      },
      env: ''
    }
  },

  created () {
    this.init()
  },

  methods: {
    async init () {
      const { data: list } = await api.project.list()
      this.list = list
    },

    removeEnv (index) {
      if (this.form.env.length === 1) {
        this.$message.error('至少应当包含一个环境')
      } else {
        this.form.env.splice(index, 1)
      }
    },

    addEnv () {
      this
        .$refs
        .form
        .validateField('env', msg => {
          if (!msg && this.env) {
            this.form.env.push(this.env)
            this.form.env.sort()
            this.env = ''
          }
        })
    },

    async confirm () {
      this
        .$refs
        .form
        .validate(async valid => {
          if (valid) {
            try {
              await api.project.create(this.form)
              this.dialogVisible = false
              this.form = {
                name: '',
                description: '',
                env: [
                  'alpha',
                  'beta',
                  'production'
                ]
              }
              const { data: list } = await api.project.list()
              this.list = list
            } catch (e) {
              this.$message.error(e.response.data.message)
            }
          }
        })
    },

    showDetail (project) {
      this.$router.push({
        name: 'Detail',
        params: {
          id: project._id
        }
      })
    }
  }
}
</script>

<style lang="stylus">
</style>
