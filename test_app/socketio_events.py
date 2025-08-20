# from flask import request
# from project import socketio, active_tests, sid_to_username
# from flask_socketio import join_room, leave_room, emit



# @socketio.on('start_test_command')
# def handle_start_cmd(data):
#     test_id = data['test_id']
#     room    = f'test_{test_id}'
#     emit('test_started', {'msg': 'Тест почався!'}, room=room)

# @socketio.on('join_test')
# def handle_join(data):
#     test_id = data['test_id']
#     username = data['username']
#     role = data.get('role', 'participant')
#     room_name = f'test_{test_id}'

#     join_room(room_name)
#     sid_to_username[request.sid] = username

#     data_cell = active_tests.setdefault(test_id, {'participants': set(), 'results': {}})

#     if role == 'host':
#         data_cell['host_sid'] = request.sid
#         emit('host_ack', {'msg': 'Хост підключено', 'test_id': test_id}, to=request.sid)
#     else:
#         data_cell['participants'].add(username)
#         emit('participants_update', list(data_cell['participants']), room=room_name)
#         emit('participant_ack', {'msg': 'Учасник підключився'}, to=request.sid)

# @socketio.on('submit_answer') 
# def handle_answer(data):
#     test_id   = data['test_id']
#     username  = data['username']
#     is_ok     = data.get('is_correct', False)

#     cell = active_tests.get(test_id)
#     if not cell:
#         return

#     cell['results'][username] = cell['results'].get(username, 0) + (1 if is_ok else 0)
#     host_sid = cell.get('host_sid')
#     if host_sid:
#         emit('update_results', cell['results'], to=host_sid)



# @socketio.on('disconnect')
# def handle_disconnect():
#     sid = request.sid
#     username = sid_to_username.pop(sid, None)

#     for test_id, cell in list(active_tests.items()):
#         room_name = f'test_{test_id}'
#         if cell.get('host_sid') == sid:
#             emit('test_closed', room=room_name)
#             del active_tests[test_id]
#         else:
#             if username and username in cell['participants']:
#                 cell['participants'].remove(username)
#                 emit('participants_update', list(cell['participants']), room=room_name)
