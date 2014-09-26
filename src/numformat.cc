#include <stdio.h>
#include <stdlib.h>
#include <sstream>

#include <v8.h>
#include <node.h>

#include <unicode/errorcode.h>
#include <unicode/unum.h>
#include <unicode/stringpiece.h>

#define EXCEPTION(type, message) \
	ThrowException(v8::Exception::type(v8::String::New(message)))

class NumFormatter : public node::ObjectWrap
{
public:
	static void Initialize(const v8::Handle<v8::Object> target) {
		v8::HandleScope scope;

		v8::Local<v8::FunctionTemplate> constructorTemplate = v8::FunctionTemplate::New(NumFormatter::New);

		constructorTemplate->InstanceTemplate()->SetInternalFieldCount(1);

		// setup methods
		NODE_SET_PROTOTYPE_METHOD(constructorTemplate, "format", NumFormatter::Format);

		// export class
		target->Set(v8::String::NewSymbol("NumFormatter"), constructorTemplate->GetFunction());
	}

	// JS Constructor
	static v8::Handle<v8::Value>
	New(const v8::Arguments& args) {
		if (args.Length() < 2 || !args[0]->IsUint32() || !args[1]->IsString())
			return EXCEPTION(TypeError, "Expected UNumberFormatStyle value for the argument");

		UNumberFormatStyle style = static_cast<UNumberFormatStyle>(args[0]->Uint32Value());
		std::string locale(*v8::String::Utf8Value(args[1]->ToString()));

		try {
			NumFormatter* n = new NumFormatter(style, locale.c_str());
			n->Wrap(args.This()); // under GC
		} catch (const char* errorMessage) {
				return EXCEPTION(Error, errorMessage);
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
	~NumFormatter () {
		unum_close(unumber_format_);
	}

private:

	class ResultString : public v8::String::ExternalStringResource {
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

	static v8::Handle<v8::Value> Format(const v8::Arguments& args) {
		// Extract the C++ request object from the JavaScript wrapper.
		NumFormatter* n = node::ObjectWrap::Unwrap<NumFormatter>(args.This());
		ResultString* result;
		try {
			switch(n->style) {
				case UNUM_DECIMAL:
				case UNUM_PERCENT:
					if (args.Length() != 1 || !args[0]->IsNumber())
						return EXCEPTION(TypeError, "Expected a single, numeric argument");

					result = n->format(args[0]->NumberValue());
					break;
				case UNUM_CURRENCY:
					if (args.Length() != 2 || !args[0]->IsNumber() || !args[1]->IsString())
						return EXCEPTION(TypeError, "Expected two arguments: number, currency");

					result = n->formatCurrency(args[0]->NumberValue(), args[1]->ToString()->GetExternalAsciiStringResource()->data());
					break;
				default:
					return EXCEPTION(Error, "Unsupported style");
			}
		} catch (const char* errorMessage) {
			return EXCEPTION(Error, errorMessage);
		}

		return v8::String::NewExternal(result);
	}

	ResultString* format(const double number) {
		UChar* result = NULL;
		UErrorCode err = U_ZERO_ERROR;
		uint32_t	result_length = 0;
    uint32_t needed_length = 0;
		uint32_t i = 0;

		do {
			err = U_ZERO_ERROR;
			needed_length = unum_formatDouble(this->unumber_format_, number, result, result_length, NULL, &err);
			result_length = needed_length + 1;
			if(err == U_BUFFER_OVERFLOW_ERROR)
				result=(UChar*)malloc(sizeof(UChar) * (result_length));
			i++;
		} while(err == U_BUFFER_OVERFLOW_ERROR && i < 2);

		if(U_FAILURE(err)) {
			std::stringstream errstr;
			errstr << "Unable to format value, error: " << err << "; result length: " << result_length;
			throw errstr.str().c_str();
		}

		return new ResultString(result, result_length - 1);
	}

	ResultString* formatCurrency(const double number, const char* currency) {
		UChar* result = NULL;
		UErrorCode err = U_ZERO_ERROR;
		int	result_length = 0;

		UnicodeString ucurrency = UnicodeString::fromUTF8(StringPiece(currency));
		do {
			result_length = unum_formatDoubleCurrency(this->unumber_format_, number, ucurrency.getBuffer(3), result, result_length, NULL, &err);
		} while(err == U_BUFFER_OVERFLOW_ERROR);

		if(U_FAILURE(err)) {
			std::stringstream errstr;
			errstr << "Unable to format value, error: " << err << "; result length: " << result_length;
			throw errstr.str().c_str();
		}

		return new ResultString(result, result_length);
	}

	UNumberFormat* unumber_format_;
	UNumberFormatStyle style;
};

extern "C"
void init(v8::Handle<v8::Object> target) {
	NumFormatter::Initialize(target);
}

NODE_MODULE(numformat, init)
