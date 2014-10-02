{
  "targets": [
    {
      "target_name": "numformat",
      "sources": ["lib/numformat.cc"],
      'include_dirs' : [
        "<!(node -e \"require('nan')\")"
      ],
      "libraries": ["<!@(icu-config --ldflags)"],
      "cflags": ["<!@(icu-config --cppflags)"],
			'cflags_cc!': [ '-fno-exceptions' ],
      "conditions": [
        ['OS=="mac"', {
          "OTHER_CFLAGS": ["<!@(icu-config --cppflags)"],
          "xcode_settings": {
            "GCC_ENABLE_CPP_EXCEPTIONS": "YES"
          }
        }]
      ]
    }
  ]
}
