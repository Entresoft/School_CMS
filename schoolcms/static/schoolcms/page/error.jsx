/** @jsx React.DOM */

SC.ErrorPage = React.createClass({
  error: {
    // 4xx
    400: 'Bad Request 錯誤的請求。',
    401: 'Unauthorized',
    402: 'Payment Required',
    403: 'Forbidden 伺服器拒絕執行請求。',
    404: 'Not Found 找不到和這個網址有關的資料。',
    405: 'Method Not Allowed ',
    406: 'Not Acceptable',
    407: 'Proxy Authentication Required',
    408: 'Request Timeout',
    409: 'Conflict',
    410: 'Gone',
    411: 'Length Required',
    412: 'Precondition Failed',
    413: 'Request Entity Too Large',
    414: 'Request-URI Too Long',
    415: 'Unsupported Media Type',
    416: 'Requested Range Not Satisfiable',
    417: 'Expectation Failed',
    418: 'I\'m a teapot',
    421: 'There are too many connections from your internet address',
    422: 'Unprocessable Entity',
    423: 'Locked',
    424: 'Failed Dependency',
    425: 'Unordered Collection',
    426: 'Upgrade Required',
    // 5xx
    500: 'Internal Server Error 伺服器發生未知的錯誤，請等待管理員修復。',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Service Unavailable 伺服器因為臨時的狀況暫時無法提供服務。',
    504: 'Gateway Timeout ',
    505: 'HTTP Version Not Supported',
    506: 'Variant Also Negotiates',
    507: 'Insufficient Storage',
    509: 'Bandwidth Limit Exceeded',
    510: 'Not Extended',
  },
  get_error_description: function(error_code){
    return this.error[error_code]?this.error[error_code]:'';
  },
  render: function() {
    return (
      <RB.Grid>
        <h1>{this.props.errorCode} {this.get_error_description(this.props.errorCode)}</h1>
      </RB.Grid>
    );
  }
})
