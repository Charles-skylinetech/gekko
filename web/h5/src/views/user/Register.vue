<template>
  <div class="main user-layout-register">
    <h3>
      <span>Register</span>
    </h3>
    <a-form ref="formRegister" :form="form" id="formRegister">
      <a-form-item>
        <a-input
          size="large"
          type="text"
          placeholder="Email"
          v-decorator="['email', {rules: [{ required: true, type: 'email', message: 'please input email' }], validateTrigger: ['change', 'blur']}]"
        ></a-input>
      </a-form-item>
      <a-form-item>
        <a-input
          size="large"
          type="text"
          placeholder="First Name"
          v-decorator="['firstName', {rules: [{ required: true, message: 'please input' }], validateTrigger: ['change', 'blur']}]"
        ></a-input>
      </a-form-item>
      <a-form-item>
        <a-input
          size="large"
          type="text"
          placeholder="Last Name"
          v-decorator="['lastName', {rules: [{ required: true, message: 'please input' }], validateTrigger: ['change', 'blur']}]"
        ></a-input>
      </a-form-item>

      <a-form-item>
        <a-input
          size="large"
          type="text"
          placeholder="Phone"
          v-decorator="['phone', {rules: [{ required: true, message: 'please input' }], validateTrigger: ['change', 'blur']}]"
        ></a-input>
      </a-form-item>

      <a-popover
        placement="rightTop"
        :trigger="['focus']"
        :getPopupContainer="(trigger) => trigger.parentElement"
        v-model="state.passwordLevelChecked"
      >
        <template slot="content">
          <div :style="{ width: '240px' }">
            <div :class="['user-register', passwordLevelClass]">
              Strong：
              <span>{{ passwordLevelName }}</span>
            </div>
            <a-progress
              :percent="state.percent"
              :showInfo="false"
              :strokeColor=" passwordLevelColor "
            />
            <div style="margin-top: 10px;">
              <span>please enter at least 6 letters</span>
            </div>
          </div>
        </template>
        <a-form-item>
          <a-input
            size="large"
            type="password"
            @click="handlePasswordInputClick"
            autocomplete="false"
            placeholder="password"
            v-decorator="['password', {rules: [{ required: true, message: 'at least 6 lettes'}, { validator: this.handlePasswordLevel }], validateTrigger: ['change', 'blur']}]"
          ></a-input>
        </a-form-item>
      </a-popover>

      <a-form-item>
        <a-input
          size="large"
          type="password"
          autocomplete="false"
          placeholder="confirm password"
          v-decorator="['password2', {rules: [{ required: true, message: 'at least 6 lettes' }, { validator: this.handlePasswordCheck }], validateTrigger: ['change', 'blur']}]"
        ></a-input>
      </a-form-item>

      <!-- <a-form-item>
        <a-input
          size="large"
          placeholder="11 位手机号"
          v-decorator="['mobile', {rules: [{ required: true, message: '请输入正确的手机号', pattern: /^1[3456789]\d{9}$/ }, { validator: this.handlePhoneCheck } ], validateTrigger: ['change', 'blur'] }]"
        >
          <a-select slot="addonBefore" size="large" defaultValue="+86">
            <a-select-option value="+86">+86</a-select-option>
            <a-select-option value="+87">+87</a-select-option>
          </a-select>
        </a-input>
      </a-form-item>-->
      <!--<a-input-group size="large" compact>
            <a-select style="width: 20%" size="large" defaultValue="+86">
              <a-select-option value="+86">+86</a-select-option>
              <a-select-option value="+87">+87</a-select-option>
            </a-select>
            <a-input style="width: 80%" size="large" placeholder="11 位手机号"></a-input>
      </a-input-group>-->

      <a-row :gutter="16">
        <a-col class="gutter-row" :span="16">
          <a-form-item>
            <a-input
              size="large"
              type="text"
              placeholder="pass code"
              v-decorator="['captcha', {rules: [{ required: true, message: 'please input code' }], validateTrigger: 'blur'}]"
            >
              <a-icon slot="prefix" type="mail" :style="{ color: 'rgba(0,0,0,.25)' }" />
            </a-input>
          </a-form-item>
        </a-col>
        <a-col class="gutter-row" :span="8">
          <a-button
            class="getCaptcha"
            size="large"
            :disabled="state.smsSendBtn"
            @click.stop.prevent="getCaptcha"
            v-text="!state.smsSendBtn && 'Get Code'||(state.time+' s')"
          ></a-button>
        </a-col>
      </a-row>
      <a-form-item>
        <a-switch checked-children="Admin User" v-model="isProvider" un-checked-children="Common User" default-checked />
      </a-form-item>
      <a-form-item>
        <a-button
          size="large"
          type="primary"
          htmlType="submit"
          class="register-button"
          :loading="registerBtn"
          @click.stop.prevent="handleSubmit"
          :disabled="registerBtn"
        >Register</a-button>
        <router-link class="login" :to="{ name: 'login' }">Already got Account</router-link>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import { mixinDevice } from '@/utils/mixin.js'
import { getSmsCaptcha, register } from '@/api/login'
import { mapActions } from 'vuex'
const levelNames = {
  0: 'low',
  1: 'low',
  2: 'mid',
  3: 'strong'
}
const levelClass = {
  0: 'error',
  1: 'error',
  2: 'warning',
  3: 'success'
}
const levelColor = {
  0: '#ff0000',
  1: '#ff0000',
  2: '#ff7e05',
  3: '#52c41a'
}

export default {
  name: 'Register',
  components: {},
  mixins: [mixinDevice],
  data() {
    return {
      form: this.$form.createForm(this),
      isProvider: true,
      state: {
        time: 60,
        smsSendBtn: false,
        passwordLevel: 0,
        passwordLevelChecked: false,
        percent: 10,
        progressColor: '#FF0000'
      },
      registerBtn: false
    }
  },
  computed: {
    passwordLevelClass() {
      return levelClass[this.state.passwordLevel]
    },
    passwordLevelName() {
      return levelNames[this.state.passwordLevel]
    },
    passwordLevelColor() {
      return levelColor[this.state.passwordLevel]
    }
  },
  methods: {
    ...mapActions(['Login']),
    handlePasswordLevel(rule, value, callback) {
      let level = 0

      // 判断这个字符串中有没有数字
      if (/[0-9]/.test(value)) {
        level++
      }
      // 判断字符串中有没有字母
      if (/[a-zA-Z]/.test(value)) {
        level++
      }
      // 判断字符串中有没有特殊符号
      if (/[^0-9a-zA-Z_]/.test(value)) {
        level++
      }
      this.state.passwordLevel = level
      this.state.percent = level * 30
      if (level >= 2) {
        if (level >= 3) {
          this.state.percent = 100
        }
        callback()
      } else {
        if (level === 0) {
          this.state.percent = 10
        }
        callback(new Error('password wrong'))
      }
    },

    handlePasswordCheck(rule, value, callback) {
      const password = this.form.getFieldValue('password')
      console.log('value', value)
      if (value === undefined) {
        callback(new Error('please input password'))
      }
      if (value && password && value.trim() !== password.trim()) {
        callback(new Error('confrim password wrong'))
      }
      callback()
    },

    handlePhoneCheck(rule, value, callback) {
      console.log('handlePhoneCheck, rule:', rule)
      console.log('handlePhoneCheck, value', value)
      console.log('handlePhoneCheck, callback', callback)

      callback()
    },

    handlePasswordInputClick() {
      if (!this.isMobile()) {
        this.state.passwordLevelChecked = true
        return
      }
      this.state.passwordLevelChecked = false
    },

    handleSubmit() {
      const {
        form: { validateFields },
        state,
        Login,
        $router
      } = this
      validateFields({ force: true }, (err, values) => {
        if (!err) {
          state.passwordLevelChecked = false
          values.isProvider = this.isProvider
          register(values)
            .then(res => {
              if (res.code === 200) {
                const loginParams = { email: values.email, password: values.password }

                Login(loginParams)
                  .then(res => $router.push({ path: '/' }))
                  .catch(err => {
                    this.$notification['error']({
                      message: 'Error',
                      description: err.response || 'login fail,please try later',
                      duration: 4
                    })
                  })
              } else {
                this.$notification['error']({
                  message: 'Error',
                  description: err.response || 'rigister fail,please contact skyline tech',
                  duration: 4
                })
              }
            })
            .catch(err => {
              this.$notification['error']({
                message: 'Error',
                description: err.response || 'register fail,please try later',
                duration: 4
              })
            })
          // $router.push({ name: 'registerResult', params: { ...values } })
        }
      })
    },

    getCaptcha(e) {
      e.preventDefault()
      const {
        form: { validateFields },
        state,
        $message
      } = this

      validateFields(['email'], { force: true }, (err, values) => {
        if (!err) {
          state.smsSendBtn = true

          const interval = window.setInterval(() => {
            if (state.time-- <= 0) {
              state.time = 60
              state.smsSendBtn = false
              window.clearInterval(interval)
            }
          }, 1000)

          const hide = $message.loading('pass code sending..', 0)

          getSmsCaptcha({ email: values.email })
            .then(res => {
              setTimeout(hide, 2500)
              // $notification['success']({
              //   message: 'Warning',
              //   description: '验证码获取成功，您的验证码为：' + res.result.captcha,
              //   duration: 8
              // })
            })
            .catch(err => {
              setTimeout(hide, 1)
              clearInterval(interval)
              state.time = 60
              state.smsSendBtn = false
              this.requestFailed(err)
            })
        }
      })
    },
    requestFailed(err) {
      this.$notification['error']({
        message: 'Error',
        description: ((err.response || {}).data || {}).message || 'please retry',
        duration: 4
      })
      this.registerBtn = false
    }
  },
  watch: {
    'state.passwordLevel'(val) {
      console.log(val)
    }
  }
}
</script>
<style lang="less">
.user-register {
  &.error {
    color: #ff0000;
  }

  &.warning {
    color: #ff7e05;
  }

  &.success {
    color: #52c41a;
  }
}

.user-layout-register {
  .ant-input-group-addon:first-child {
    background-color: #fff;
  }
}
</style>
<style lang="less" scoped>
.user-layout-register {
  & > h3 {
    font-size: 16px;
    margin-bottom: 20px;
  }

  .getCaptcha {
    display: block;
    width: 100%;
    height: 40px;
  }

  .register-button {
    width: 50%;
  }

  .login {
    float: right;
    line-height: 40px;
  }
}
</style>
