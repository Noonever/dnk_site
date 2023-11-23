def snake_to_camel_case(snake_str):
    parts = snake_str.split('_')
    return parts[0] + ''.join(part.capitalize() for part in parts[1:])

def convert_keys_to_camel_case(obj):
    if isinstance(obj, list):
        return [convert_keys_to_camel_case(item) for item in obj]
    elif isinstance(obj, dict):
        new_dict = {}
        for key, value in obj.items():
            new_key = snake_to_camel_case(key)
            new_value = convert_keys_to_camel_case(value)
            new_dict[new_key] = new_value
        return new_dict
    else:
        return obj



