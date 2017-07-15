<template lang="pug">
  #page-detail
    .project-detail__header
      .project-detail__title
        span(@click="goBack")
        h1 {{ project.name }}
      .project-detail__date
        i.el-icon-time
        span 更新于 {{ project.updatedAt | fronNow }}
      .project-detail__description
        p {{ project.description }}

    .project-detail__content
      .project-detail__toolbar
        div
          el-select(v-model="env", @change="getRecords")
            el-option(
              v-for="env in project.env"
              :key="env"
              :label="env"
              :value="env"
            )


        div
          el-button(icon="share", @click="openLink", v-show="records.length") 打开链接
          el-dropdown(@command="showTransferDialog", v-show="records.length")
            el-button(type="defalut")
              span 发布到其他环境
              i.el-icon-caret-bottom.el-icon--right
            el-dropdown-menu(slot="dropdown")
              el-dropdown-item(
                v-for="e in project.env"
                :key="e"
                :command="e"
                v-if="e !== env"
              ) {{ e }}
          el-button(icon="upload2", @click="showUploadDialog") 上传压缩包
          el-button(icon="setting", @click="showSettingDialog") 项目设置

      .project-detail__table
        el-table(:data="records")
          el-table-column(label="类型")
            template(scope="scope")
              span(:class="scope.row.type") {{  scope.row.type.toUpperCase() }}
          el-table-column(
            v-for="column in columns"
            :key="column._id"
            v-bind="column"
          )
          el-table-column(label="操作")
            template(scope="scope")
              el-tooltip(placement="top", content="下载压缩包")
                el-button(icon="document", @click="download(scope.row)")
              el-tooltip(placement="top", content="回滚")
                el-button(icon="warning", @click="rollback(scope.row._id)")
              el-tooltip(placement="top", content="预览")
                el-button(icon="search", @click="view(scope.row)")

    el-dialog(v-model="transferDialogVisible", title="发布到其他环境")
      el-form(:model="transferForm", label-position="top", :rules="rules", ref="transferForm")
        el-form-item(label="新环境", prop="env")
          span {{ transferForm.env }}
        el-form-item(label="描述", prop="description")
          el-input(
            type="textarea"
            placeholder="描述为什么进行这次发布"
            v-model="transferForm.description"
          )
        el-button.full(type="primary", @click="transfer") 确定

    el-dialog(v-model="settingDialogVisible", title="项目设置")
      el-form(:model="settingForm", :rules="rules", ref="settingForm", label-position="top")
        el-form-item(label="名称", prop="name")
          span {{ settingForm.name }}
        el-form-item(label="描述", prop="description")
          el-input(v-model="settingForm.description", type="textarea")
        el-form-item(label="环境", prop="env")
          el-input(v-model="inputEnv", placeholder="输入环境名 Enter 确认", @keydown.native.enter="addEnv")
        .tags
          el-tag(
            v-for="(env, index) in settingForm.env"
            closable
            type="gray"
            :key="env"
            @close="removeEnv(index)"
          ) {{ env }}
        el-button.full(type="primary", @click="updateSetting") 确定

    el-dialog(v-model="uploadDialogVisible", title="上传 Zip 压缩包")
      el-form(:model="uploadForm", :rules="uploadRules", ref="uploadForm", label-position="top")
        el-form-item(label="项目")
          span {{ this.project.name }}
        el-form-item(label="环境", prop="env")
          el-select(v-model="uploadForm.env")
            el-option(
              v-for="env in project.env"
              :key="env"
              :label="env"
              :value="env"
            )
        el-form-item(label="描述", prop="description")
          el-input(type="textarea", v-model="uploadForm.description", placeholder="压缩包内容")
        el-form-item(label="压缩包", prop="zip")
          el-upload(
            drag
            :class="uploadClass"
            action="http://api.ufaas.me/v1/upload"
            accept="application/zip"
            :headers="headers"
            :on-success="handleUploadSuccess"
            :on-remove="handleUploadRemove"
            ref="upload"
          )
            i.el-icon-upload
            .el-upload__text 将文件拖到此处，或者点击上传
            .el-upload__tip 只能上传 zip 文件
        el-button.full(type="primary", @click="upload") 确定
</template>

<script>
import api from '@/api'
import moment from 'moment'
moment.locale('zh-CN')

export default {
  data () {
    return {
      project: {},
      env: '',
      records: [],

      columns: [
        { label: '描述', prop: 'description' },
        { label: '操作者', prop: 'username' },
        { label: '操作时间', prop: 'updatedAt', formatter: (row, column) => moment(row.updatedAt).format('YYYY-MM-DD HH:mm:ss') },
      ],

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
              if (!this.inputEnv) {
                return cb()
              }
              if (!/^[a-z][a-z0-9-]*$/.test(this.inputEnv)) {
                return cb('环境名必需以小写字母开头，且只包含小写字母、数字以及 -')
              }
              if (value.indexOf(this.inputEnv) !== -1) {
                return cb('环境已存在')
              }
              return cb()
            }
          }
        ]
      },

      transferDialogVisible: false,
      transferForm: {
        id: '',
        description: '',
        env: ''
      },

      inputEnv: '',
      settingDialogVisible: false,
      settingForm: {
        name: '',
        description: '',
        env: []
      },

      uploadDialogVisible: false,
      uploadForm: {
        project: '',
        description: '',
        zip: '',
        env: ''
      },
      uploadRules: {
        description: [
          { required: true, message: '描述不能为空', trigger: 'change' }
        ],
        zip: [
          { required: true, message: '压缩文件不能为空', trigger: 'change' }
        ]
      }
    }
  },

  filters: {
    fronNow (value) {
      return moment(value).fromNow()
    }
  },

  computed: {
    id () {
      return this.$route.params.id
    },

    headers () {
      return {
        Authorization: `Bearer ${ window.sessionStorage.token }`
      }
    },

    uploadClass () {
      return `custom-upload ${ this.uploadForm.zip ? 'uploaded' : '' }`
    }

  },

  created () {
    this.init()
  },

  methods: {
    async init () {
      const { data: project } = await api.project.get(this.id)
      this.project = project
      this.env = this.project.env[0]
    },

    goBack () {
      this.$router.push('/list')
    },

    async getRecords (env) {
      const { data: records } = await api.record.list(env, this.id)
      this.records = records
    },

    openLink () {
      const { project, env } = this
      const envPrefix = env === 'production' ? '' : `.${ env }`
      const url = `http://${ project.name }${ envPrefix }.ucdn.me`
      window.open(url, '_blank')
    },

    download (record) {
      const [ , hash ] = record.unzip.match(/([^/]*)$/)
      const url = `http://zip.ufaas.me/${ hash }.zip`
      window.open(url, '_blank')
    },

    view (record) {
      const [ , hash ] = record.unzip.match(/([^/]*)$/)
      const url = `http://unzip.ufaas.me/${ hash }`
      window.open(url, '_blank')
    },

    showTransferDialog (env) {
      this.transferDialogVisible = true
      this.$nextTick(() => {
        this.$refs.transferForm.resetFields()
        this.transferForm = {
          env,
          id: this.records[0]._id,
          description: this.records[0].description
        }
      })
    },

    transfer () {
      this
        .$refs
        .transferForm
        .validate(async valid => {
          if (valid) {
            try {
              await api.record.transfer(this.transferForm)
              this.transferDialogVisible = false
              this.env = this.transferForm.env
              this.transferForm = {
                env: '',
                id: '',
                description: ''
              }
              this.$message.success('发布成功')
            } catch (e) {
              this.$message.error(e.response.data.message)
            }
          }
        })
    },

    async rollback (id) {
      try {
        await api.record.rollback({ id })
        this.$message.success('回滚成功')
        this.getRecords(this.env)
      } catch (e) {
        this.$message.error(e.response.data.message)
      }
    },

    removeEnv (index) {
      if (this.settingForm.env.length === 1) {
        this.$message.error('至少应当包含一个环境')
      } else {
        this.settingForm.env.splice(index, 1)
      }
    },

    addEnv () {
      this
        .$refs
        .settingForm
        .validateField('env', msg => {
          if (!msg && this.inputEnv) {
            this.settingForm.env.push(this.inputEnv)
            this.settingForm.env.sort()
            this.inputEnv = ''
          }
        })
    },

    showSettingDialog () {
      this.settingDialogVisible = true
      this.$nextTick(() => {
        this.$refs.settingForm.resetFields()
        this.settingForm = {
          name: this.project.name,
          description: this.project.description,
          env: this.project.env
        }
      })
    },

    updateSetting () {
      this
        .$refs
        .settingForm
        .validate(async valid => {
          if (valid) {
            try {
              const { data: project } = await api.project.update(this.id, this.settingForm)
              this.project = project
              this.settingDialogVisible = false
              this.$message.success('修改成功')
            } catch (e) {
              this.$message.error(e.response.data.message)
            }
          }
        })
    },

    showUploadDialog () {
      this.uploadDialogVisible = true
      this.$nextTick(() => {
        this.$refs.uploadForm.resetFields()
        this.uploadForm = {
          project: this.id,
          description: '',
          zip: '',
          env: this.env
        }
      })
    },

    handleUploadSuccess (hash) {
      this.uploadForm.zip = hash
    },

    handleUploadRemove () {
      this.uploadForm.zip = ''
    },

    upload () {
      this
        .$refs
        .uploadForm
        .validate(async valid => {
          if (valid) {
            try {
              await api.record.upload(this.uploadForm)
              this.uploadDialogVisible = false
              this.$message.success('上传成功')
              this.env = this.uploadForm.env
              this.getRecords(this.env)
              this.$refs.upload.clearFiles()
            } catch (e) {
              this.$message.error(e.response.data.message)
            }
          }
        })
    }
  }
}
</script>
