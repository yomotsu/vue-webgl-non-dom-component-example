<script>
export default {
  name: 'SomeComponent',
  data() {
    return {
    };
  },
  props: {
    data1: Number,
  },
  mounted() {
    console.log('mounted', `props:  + ${ this.data1 }`);
  },
  render() {
    
  },
}
</script>
