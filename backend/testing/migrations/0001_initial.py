from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ('academics', '0001_initial'),
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Test',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('level', models.CharField(max_length=10)),
                ('duration_minutes', models.PositiveIntegerField(default=30)),
                ('is_published', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='Question',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('question_type', models.CharField(choices=[('single_choice', 'Один вариант')], default='single_choice', max_length=40)),
                ('text', models.TextField()),
                ('order', models.PositiveIntegerField(default=1)),
                ('points', models.PositiveIntegerField(default=1)),
                ('test', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='questions', to='testing.test')),
            ],
            options={'ordering': ['order']},
        ),
        migrations.CreateModel(
            name='AnswerOption',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text', models.CharField(max_length=500)),
                ('is_correct', models.BooleanField(default=False)),
                ('order', models.PositiveIntegerField(default=1)),
                ('question', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='options', to='testing.question')),
            ],
            options={'ordering': ['order']},
        ),
        migrations.CreateModel(
            name='Attempt',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('started_at', models.DateTimeField(auto_now_add=True)),
                ('finished_at', models.DateTimeField(blank=True, null=True)),
                ('status', models.CharField(choices=[('in_progress', 'В процессе'), ('finished', 'Завершена')], default='in_progress', max_length=20)),
                ('score_percent', models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)),
                ('test', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='attempts', to='testing.test')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='attempts', to='users.user')),
            ],
        ),
        migrations.CreateModel(
            name='TestAssignment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('assigned_at', models.DateTimeField(auto_now_add=True)),
                ('group', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='test_assignments', to='academics.studentgroup')),
                ('test', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='assignments', to='testing.test')),
            ],
            options={'unique_together': {('test', 'group')}},
        ),
        migrations.CreateModel(
            name='Result',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('score_percent', models.DecimalField(decimal_places=2, max_digits=5)),
                ('level_result', models.CharField(max_length=10)),
                ('passed', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('attempt', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='result', to='testing.attempt')),
            ],
        ),
        migrations.CreateModel(
            name='Answer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('attempt', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='answers', to='testing.attempt')),
                ('question', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='answers', to='testing.question')),
                ('selected_option', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='testing.answeroption')),
            ],
            options={'unique_together': {('attempt', 'question')}},
        ),
    ]
