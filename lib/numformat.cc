#include <stdio.h>
#include <stdlib.h>
#include <sstream>
#include <iostream>
#include <map>

#include <v8.h>
#include <node.h>
#include <nan.h>

#include <unicode/errorcode.h>
#include <unicode/unum.h>
#include <unicode/putil.h>
#include <unicode/uversion.h>

using namespace v8;
using namespace std;

#define EXCEPTION(type, message) \
  ThrowException(Exception::type(NanNew<String>(message)))

class NumFormatter : public node::ObjectWrap
{
public:
  static void Initialize(const Handle<Object> target) {
    NanScope();

    Local<FunctionTemplate> constructorTemplate = NanNew<FunctionTemplate>(NumFormatter::New);

    constructorTemplate->InstanceTemplate()->SetInternalFieldCount(1);

    // setup methods
    NODE_SET_PROTOTYPE_METHOD(constructorTemplate, "format", NumFormatter::Format);
    NODE_SET_PROTOTYPE_METHOD(constructorTemplate, "setAttributes", NumFormatter::SetAttributes);

    // export class
    target->Set(NanNew("NumFormatter"), constructorTemplate->GetFunction());
    target->Set(NanNew("VERSION"), NanNew(U_ICU_VERSION));
  }

  // JS Constructor
  static NAN_METHOD(New) {
    if (args.Length() < 2 || !args[0]->IsUint32() || !args[1]->IsString())
      return NanThrowTypeError("Expected UNumberFormatStyle value for the argument");

    UNumberFormatStyle style = static_cast<UNumberFormatStyle>(args[0]->Uint32Value());
    string locale(*String::Utf8Value(args[1]->ToString()));

    if(args.Length() == 3 && !args[2]->IsNull() && !args[2]->IsObject())
      return NanThrowTypeError("The optional attributes argument should be an object");

    try {
      NumFormatter *n;
      const char * locale_cstr = locale.c_str();
      if(args.Length() == 3) {
        map<UNumberFormatAttribute, int32_t> attributes = ConvertAttributes(args[2]->ToObject());
        n = new NumFormatter(style, locale_cstr, attributes);
      } else {
        n = new NumFormatter(style, locale_cstr);
      }
      n->Wrap(args.This()); // under GC
    } catch (const char* errorMessage) {
        return NanThrowError(errorMessage);
    }

    return args.This();
  }

  NumFormatter (UNumberFormatStyle s, const char* locale) {
    UErrorCode err = U_ZERO_ERROR;
    unumber_format_ = unum_open(s, 0, 0, locale, 0, &err);
    style = s;
    if(U_FAILURE(err))
      throw "Unable to open number formatter";
  }

  NumFormatter (UNumberFormatStyle s, const char* locale, map<UNumberFormatAttribute, int32_t> attributes) {
    UErrorCode err = U_ZERO_ERROR;
    unumber_format_ = unum_open(s, 0, 0, locale, 0, &err);
    style = s;
    if(U_FAILURE(err))
      throw "Unable to open number formatter";
    setAttributes(attributes);
  }

  ~NumFormatter () {
    unum_close(unumber_format_);
  }

private:

  class ResultString : public String::ExternalStringResource {
  public:
    ResultString (UChar* input, const size_t input_length) {
      contents = input;
      content_length = input_length;
    }
    virtual size_t length() const { return content_length; }
    virtual const UChar* data() const { return contents; }
    virtual ~ResultString () {
      free(contents);
    }

  private:
    UChar* contents;
    size_t content_length;
  };

  static map<UNumberFormatAttribute, int32_t> ConvertAttributes(const Handle<Object> obj) {
    map<UNumberFormatAttribute, int32_t> attrs;

    const Local<Array> props = obj->GetPropertyNames();
    const uint32_t length = props->Length();

    for (uint32_t i=0 ; i<length ; ++i) {
      const Local<Value> key   = props->Get(i);
      const UNumberFormatAttribute attr = static_cast<UNumberFormatAttribute>(key->Uint32Value());
      attrs[attr] = obj->Get(key)->Int32Value();
    }

    return attrs;
  }

  static NAN_METHOD(Format) {
    NanScope();
    // Extract the C++ request object from the JavaScript wrapper.
    NumFormatter* n = node::ObjectWrap::Unwrap<NumFormatter>(args.This());
    ResultString* result;
    try {
      switch(n->style) {
        case UNUM_CURRENCY:
          {
            if (args.Length() != 2 || !args[0]->IsNumber() || !args[1]->IsString())
              return NanThrowTypeError("Expected two arguments: number, currency");

            string currency(*String::Utf8Value(args[1]->ToString()));
            result = n->formatCurrency(args[0]->NumberValue(), currency.c_str());
          }
          break;
        default:
          {
            if (args.Length() != 1 || !args[0]->IsNumber())
              return NanThrowTypeError("Expected a single, numeric argument");

            result = n->format(args[0]->NumberValue());
          }
          break;
      }
    } catch (const char* errorMessage) {
      return NanThrowError(errorMessage);
    }

    NanReturnValue(String::NewExternal(result));
  }

  static NAN_METHOD(SetAttributes) {
    NanScope();
    NumFormatter* n = node::ObjectWrap::Unwrap<NumFormatter>(args.This());
    if(args.Length() != 1 || !args[0]->IsObject())
      return NanThrowTypeError("Expected a single, object argument");

    Handle<Object> obj = args[0]->ToObject();
    map<UNumberFormatAttribute, int32_t> attributes = ConvertAttributes(obj);
    n->setAttributes(attributes);
    NanReturnValue(args[0]);
  }

  ResultString* format(const double number) {
    UChar* result = NULL;
    UErrorCode status = U_ZERO_ERROR;
    uint32_t result_length = 0;

    result_length = unum_formatDouble(this->unumber_format_, number, result, result_length, NULL, &status);
    if(status == U_BUFFER_OVERFLOW_ERROR) {
      status = U_ZERO_ERROR;
      result = (UChar*) malloc(sizeof(UChar) * result_length);
      unum_formatDouble(this->unumber_format_, number, result, result_length, NULL, &status);
    }

    return new ResultString(result, result_length);
  }

  ResultString* formatCurrency(const double number, const char* currency) {
    UChar* result = NULL;
    UErrorCode status = U_ZERO_ERROR;
    uint32_t result_length = 0;

    UChar ucurrency[4];
    u_charsToUChars(currency, ucurrency, 4);


    result_length = unum_formatDoubleCurrency(this->unumber_format_, number, ucurrency, result, result_length, NULL, &status);
    if(status == U_BUFFER_OVERFLOW_ERROR) {
      status = U_ZERO_ERROR;
      result = (UChar*) malloc(sizeof(UChar) * result_length);
      unum_formatDoubleCurrency(this->unumber_format_, number, ucurrency, result, result_length, NULL, &status);
      if(U_FAILURE(status))
        throw "error formatting currency";
    }

    return new ResultString(result, result_length);
  }

  void setAttributes(map<UNumberFormatAttribute, int32_t> attrs) {
    map<UNumberFormatAttribute, int32_t>::iterator iter;

    for(iter = attrs.begin(); iter != attrs.end(); ++iter) {
      unum_setAttribute(unumber_format_, iter->first, iter->second);
    }
    return;
  }

  UNumberFormat* unumber_format_;
  UNumberFormatStyle style;
};

extern "C"
void init(Handle<Object> target) {
  NumFormatter::Initialize(target);
}

NODE_MODULE(numformat, init)
